import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriend(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.friendID && !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Invalid: friendID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetFriend(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "friendID"
    ], params);

    try {
        ValidateGetFriend(params);

        let fetchFriendResponse = await db.collection("friends").findOne({ friendID: params.friendID }).toArray();

        const responseData = ResponseClient.DBModifySuccess({
            data: fetchFriendResponse,
            message: "Friend fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}