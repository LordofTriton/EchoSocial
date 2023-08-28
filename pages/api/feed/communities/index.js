import { getDB } from "../../../../util/db/mongodb";
import ParamValidator from "../../../../services/validation/validator";
import ResponseClient from "../../../../services/validation/ResponseClient";

function ValidateFeed(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function CommunitiesFeed(params) {
    params = parseParams([
        "accountID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateFeed(params);

        const userAccount = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        let communities = await db.collection("members").find({ accountID: params.accountID }).toArray()
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID}] }).toArray()
        if (!userAccount) throw new Error("Account does not exist.")

        const filters = { 
            $and: [ 
                { communityID: { $in: communities.map((obj) => obj.communityID) } },
                { communityID: { $nin: blacklist.map((obj) => obj.blockee) } },
                { communityID: { $nin: blacklist.map((obj) => obj.blocker) } },
                { accountID: { $nin: blacklist.map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.map((obj) => obj.blocker) } }
            ]
        }

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }
        const skip = (pagination.page - 1) * pagination.pageSize;

        const echoes = await db.collection("echoes").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const echoCount = await db.collection("echoes").countDocuments(filters);
        if (!echoes) throw new Error("Unable to fetch echoes.")

        let feedData = []
        for (let echo of echoes) {
            const user = (await db.collection("accounts").findOne({ accountID: echo.accountID }))
            const comments = await db.collection("comments").countDocuments({ echoID: echo.echoID })
            const community = echo.communityID ? await db.collection("communities").findOne({ communityID: echo.communityID }) : null
            const communityMember = community ? await db.collection("members").findOne({ communityID: echo.communityID, accountID: params.accountID }) : null
            let heartCount = await db.collection("hearts").countDocuments({ echoID: echo.echoID });
            let userHearted = await db.collection("hearts").findOne({ accountID: params.accountID, echoID: echo.echoID });

            const finalEchoData = {
                ...echo,
                comments,
                hearts: heartCount,
                userHearted: userHearted ? true : false,
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
            feedData.push(finalEchoData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: feedData,
            message: "Feed fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: echoCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}