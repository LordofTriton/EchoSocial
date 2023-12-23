import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteChat(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (data.targetID && !ParamValidator.isValidObjectID(data.targetID)) throw new Error("Missing or Invalid: targetID")
    if (data.chatID && !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID")
}

export default async function DeleteChat(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "targetID",
        "chatID"
    ], request.query);

    try {
        ValidateDeleteChat(params)

        const deleteChatResponse = await db.collection("chats").deleteOne(params)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteChatResponse,
            message: "Chat deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}