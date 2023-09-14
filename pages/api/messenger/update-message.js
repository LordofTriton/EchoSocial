import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import UpdateChat from "./update-chat";

function ValidateUpdateMessage(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.messageID || !ParamValidator.isValidObjectID(data.messageID)) throw new Error("Missing or Invalid: messageID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function UpdateMessage(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "messageID",
        "deleted"
    ], params);

    try {
        ValidateUpdateMessage(params);

        const message = await db.collection("messages").findOneAndUpdate({ messageID: params.messageID }, {$set: params})
        if (!message) throw new Error("Message does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: message,
            message: "Message updated successfully."
        })

        if (params.deleted) {
            const messageData = await db.collection("messages").findOne({ messageID: params.messageID })
            const chatData = await db.collection("chats").findOne({ accountID: params.accountID, chatID: messageData.chatID })
            await UpdateChat({
                accountID: params.accountID,
                chatID: messageData.chatID,
                latestMessage: {
                    text: "This message was deleted.",
                    media: null
                },
                lastUpdated: Date.now()
            }, io)
            await UpdateChat({
                accountID: chatData.targetID,
                chatID: messageData.chatID,
                latestMessage: {
                    text: "This message was deleted.",
                    media: null
                },
                lastUpdated: Date.now()
            }, io)
            io.to(chatData.accountID).emit(`UPDATED_MESSAGE_${messageData.chatID}`, JSON.stringify(messageData))
            io.to(chatData.targetID).emit(`UPDATED_MESSAGE_${messageData.chatID}`, JSON.stringify(messageData))
        }

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}