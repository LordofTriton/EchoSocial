import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import UpdateChat from "./update-chat";
import { SSEPush } from "../sse/SSEClient";
import PusherServer from "../../../services/PusherServer";
import AppConfig from "../../../util/config";

function ValidateUpdateMessage(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.messageID || !ParamValidator.isValidObjectID(data.messageID)) throw new Error("Missing or Invalid: messageID")
}

export default async function UpdateMessage(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "messageID",
        "deleted"
    ], request.body);

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
            await axios.post(AppConfig.HOST + "/api/messenger/update-chat", {
                accountID: params.accountID,
                chatID: messageData.chatID,
                latestMessage: {
                    text: "This message was deleted.",
                    media: null
                },
                lastUpdated: Date.now()
            })
            await axios.post(AppConfig.HOST + "/api/messenger/update-chat", {
                accountID: chatData.targetID,
                chatID: messageData.chatID,
                latestMessage: {
                    text: "This message was deleted.",
                    media: null
                },
                lastUpdated: Date.now()
            })

            await PusherServer.trigger(chatData.accountID, `UPDATED_MESSAGE_${messageData.chatID}`, messageData)
            await PusherServer.trigger(chatData.targetID, `UPDATED_MESSAGE_${messageData.chatID}`, messageData)
        }

        response.json(responseData);

        response.once("finish", async () => {

        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}