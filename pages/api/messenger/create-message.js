import { getDB } from "../../../util/db/mongodb";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import TokenGenerator from "../../../services/generators/TokenGenerator";

import NickGenerator from "../../../services/generators/NIckGenerator";

function ValidateCreateMessage(data) {
    if (!data.chatID || !ParamValidator.isValidAccountID(data.chatID)) throw new Error("Missing or Invalid: chatID.")
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.content) throw new Error("Missing or Invalid: content.")
    if (data.content) {
        if (data.content.text && data.content.text.length < 1) throw new Error("Missing or Invalid: content text.")
    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async (request, response) => {
    let params = parseParams([
        "chatID",
        "accountID",
        "content",
        "datetime",
        "repliedTo"
    ], request.body);

    try {
        ValidateCreateMessage(params)

        const messageData = {
            chatID: params.chatID,
            accountID: params.accountID,
            content: {
                text: params.content.text,
                media: params.content.media,
                link: params.content.link
            },
            datetime: Date.now(),
            repliedTo: params.repliedTo
        }

        const createMessageResponse = await db.collection("messages").insertOne(messageData)
        if (createMessageResponse.errors) throw new Error("An error occured when creating message.");

        await db.collection("chats").updateOne({ chatID: params.chatID }, { lastUpdated: Date.now() })

        const responseData = ResponseClient.DBModifySuccess({
            data: messageData,
            message: "Message created successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}