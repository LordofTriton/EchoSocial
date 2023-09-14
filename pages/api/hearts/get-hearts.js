import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetHearts(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.userID && !ParamValidator.isValidAccountID(data.userID)) throw new Error("Invalid: userID.")
    if (data.echoID && !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Invalid: echoID.")
    if (data.commentID && !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Invalid: commentID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetHearts(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "commentID",
        "userID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetHearts(params);

        const filters = {
            accountID: params.accountID
        }
        if (params.echoID) heartData.echoID = params.echoID;
        if (params.commentID) heartData.commentID = params.commentID;
        if (params.userID) heartData.userID = params.userID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchHeartsResponse = await db.collection("hearts").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const heartCount = await db.collection("hearts").countDocuments(filters);
        if (fetchHeartsResponse.length < 1) fetchHeartsResponse = [];

        let heartData = []
        for (let heart of fetchHeartsResponse) {
            const user = (await db.collection("accounts").findOne({ accountID: heart.accountID }))
            const finalHeartData = {
                ...heart,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            heartData.push(finalHeartData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: heartData.reverse(),
            message: "Hearts fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: heartCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}