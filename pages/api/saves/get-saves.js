import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetSaves(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.saveID && !ParamValidator.isValidObjectID(data.saveID)) throw new Error("Invalid: saveID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetSaves(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetSaves(params);

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchSavesResponse = await db.collection("saves").find({ accountID: params.accountID }).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const saveCount = await db.collection("saves").countDocuments({ accountID: params.accountID });
        if (fetchSavesResponse.length < 1) fetchSavesResponse = [];

        let saveData = []
        for (let save of fetchSavesResponse) {
            const echo = await db.collection("echoes").findOne({ echoID: save.echoID })
            const user = (await db.collection("accounts").findOne({ accountID: echo.accountID }))
            const comments = await db.collection("comments").countDocuments({ echoID: echo.echoID })
            const community = echo.communityID ? await db.collection("communities").findOne({ communityID: echo.communityID }) : null
            const communityMember = community ? await db.collection("members").findOne({ communityID: echo.communityID, accountID: echo.accountID }) : null
            let heartCount = await db.collection("hearts").countDocuments({ echoID: echo.echoID });
            let userHearted = await db.collection("hearts").findOne({ accountID: params.accountID, echoID: echo.echoID });
            let userSaved = await db.collection("saves").findOne({ accountID: params.accountID, echoID: echo.echoID });

            const finalEchoData = {
                ...echo,
                comments,
                hearts: heartCount,
                userHearted: userHearted ? true : false,
                userSaved: userSaved ? true : false,
                userData: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImage: user.profileImage
                },
                communityData: {
                    name: community ? community.displayName : null,
                    profileImage: community ? community.profileImage : null,
                    userRole: communityMember ? communityMember.role : null
                }
            }
            saveData.push(finalEchoData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: saveData.reverse(),
            message: "Savees fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: saveCount,
            pagination: true
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}