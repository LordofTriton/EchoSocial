import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteChat(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Invalid: chatID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async (request, response) => {
    let params = parseParams([
        "accountID",
        "chatID"
    ], request.query);

    try {
        ValidateDeleteChat(params)

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;
        if (params.chatID) filters.chatID = params.chatID;

        const deleteChatResponse = await db.collection("chats").deleteOne(filters)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteChatResponse,
            message: "Chat deleted successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}