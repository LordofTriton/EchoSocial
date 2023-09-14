import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import DeleteChat from "../messenger/delete-chat";

function ValidateDeleteFriend(data) {
    if (!data.friendID || !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Missing or Invalid: friendID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteFriend(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "friendID"
    ], params);

    try {
        ValidateDeleteFriend(params)

        await db.collection("friends").deleteOne({
            accountID: params.accountID,
            friendID: params.friendID
        })
        await db.collection("friends").deleteOne({
            accountID: params.friendID,
            friendID: params.accountID
        })

        const responseData = ResponseClient.DBModifySuccess({
            data: null,
            message: "Friend deleted successfully."
        })
        
        await DeleteChat({
            accountID: params.accountID,
            targetID: params.friendID
        })

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}