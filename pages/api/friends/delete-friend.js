import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
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

export default async function DeleteFriend(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "friendID"
    ], request.query);

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

        response.json(responseData);

        response.once("finish", async () => {
            await axios.post(request.headers.origin + "/api/chats/delete-chat", {
                accountID: params.accountID,
                targetID: params.friendID
            })
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}