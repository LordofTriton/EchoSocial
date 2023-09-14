import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteChat(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (data.targetID && !ParamValidator.isValidObjectID(data.targetID)) throw new Error("Missing or Invalid: targetID")
    if (data.chatID && !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteChat(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "targetID",
        "chatID"
    ], params);

    try {
        ValidateDeleteChat(params)

        const deleteChatResponse = await db.collection("chats").deleteOne(params)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteChatResponse,
            message: "Chat deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}