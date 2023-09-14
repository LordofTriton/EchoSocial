import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import DeleteChat from "../messenger/delete-chat";
import DeleteFriend from "../friends/delete-friend";

function ValidateDeleteHeart(data) {
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

export default async function DeleteHeart(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "commentID",
        "userID"
    ], params);

    try {
        ValidateDeleteHeart(params)

        const deleteHeartResponse = await db.collection("hearts").deleteOne(params)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteHeartResponse,
            message: "Heart deleted successfully."
        })

        if (params.userID) {
            await DeleteFriend({
                accountID: params.accountID,
                friendID: params.userID
            })
        }

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}