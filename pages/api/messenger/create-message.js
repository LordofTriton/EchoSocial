import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import UpdateChat from "./update-chat";
import CreateChat from "./create-chat";

function ValidateCreateMessage(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID.")
    if (!data.content) throw new Error("Missing or Invalid: content.")
    if (data.content) {
        if (data.content.text && data.content.text.length < 1) throw new Error("Missing or Invalid: content text.")
        if (data.content.text && data.content.media) throw new Error("You cannot have text and media in the same message.")
    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateMessage(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "chatID",
        "content",
        "repliedTo"
    ], params);

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

        io.to(chat.targetID).emit(`NEW_MESSAGE_${params.chatID}`, JSON.stringify(result))

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Message created successfully."
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateMessageCallback(params, io) {
    const { db } = await getDB();
    const userChat = (await db.collection("chats").findOne({ accountID: params.accountID, chatID: params.chatID }))
    await UpdateChat({
        accountID: params.accountID,
        chatID: params.chatID,
        latestMessage: params.content,
        lastUpdated: Date.now()
    }, io)
    const targetChat = (await db.collection("chats").findOne({ accountID: userChat.targetID, chatID: params.chatID }))
    if (!targetChat) {
        await CreateChat({
            accountID: userChat.targetID,
            targetID: params.accountID,
            latestMessage: params.content
        }, io)
    } else {
        await UpdateChat({
            accountID: targetChat.accountID,
            chatID: params.chatID,
            latestMessage: params.content,
            lastUpdated: Date.now()
        }, io)
    }
}