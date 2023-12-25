import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import UpdateChat from "./update-chat";
import CreateChat from "./create-chat";
import { SSEPush } from "../sse/SSEClient";
import PusherServer from "../../../services/PusherServer";
import AppConfig from "../../../util/config";

function ValidateCreateMessage(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID.")
    if (!data.content) throw new Error("Missing or Invalid: content.")
    if (data.content) {
        if (data.content.text && data.content.text.length < 1) throw new Error("Missing or Invalid: content text.")
        if (data.content.text && data.content.media) throw new Error("You cannot have text and media in the same message.")
    }
}

export default async function CreateMessage(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "chatID",
        "content",
        "repliedTo"
    ], request.body);

    try {
        ValidateCreateMessage(params)
        const chat = (await db.collection("chats").findOne({ accountID: params.accountID, chatID: params.chatID }))
        if (!chat) throw new Error("This chat is closed.")

        let isFriend = await db.collection("friends").findOne({ accountID: params.accountID, friendID: chat.targetID })
        if (!isFriend) throw new Error("You cannot send messages to this user.")

        const messageData = {
            messageID: IDGenerator.GenerateMessageID(),
            chatID: params.chatID,
            accountID: params.accountID,
            content: {
                text: params.content.text,
                media: params.content.media
            },
            datetime: Date.now(),
            repliedTo: params.repliedTo,
            deleted: false
        }

        const createMessageResponse = await db.collection("messages").insertOne(messageData)
        if (createMessageResponse.errors) throw new Error("An error occured when creating message.");

        await db.collection("chats").updateMany({ accountID: chat.targetID, chatID: chat.chatID }, { $inc: { unread: 1 } })

        const messageUser = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const result = {
            ...messageData,
            firstName: messageUser.firstName,
            lastName: messageUser.lastName,
            profileImage: messageUser.profileImage
        }
        
        await PusherServer.trigger(chat.targetID, `NEW_MESSAGE_${chat.chatID}`, result)

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Message created successfully."
        })
        
        response.json(responseData);
        
        response.once("finish", async () => {
            await CreateMessageCallback(params, AppConfig.HOST)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function CreateMessageCallback(params, reqOrigin) {
    const { db } = await getDB();
    const userChat = (await db.collection("chats").findOne({ accountID: params.accountID, chatID: params.chatID }))
    await axios.post(reqOrigin + "/api/messenger/update-chat", {
        accountID: params.accountID,
        chatID: params.chatID,
        latestMessage: params.content,
        lastUpdated: Date.now()
    })
    const targetChat = (await db.collection("chats").findOne({ accountID: userChat.targetID, chatID: params.chatID }))
    if (!targetChat) {
        await axios.post(reqOrigin + "/api/messenger/create-chat", {
            accountID: userChat.targetID,
            targetID: params.accountID,
            latestMessage: params.content
        })
    } else {
        await axios.post(reqOrigin + "/api/messenger/update-chat", {
            accountID: targetChat.accountID,
            chatID: params.chatID,
            latestMessage: params.content,
            lastUpdated: Date.now()
        })
    }
}