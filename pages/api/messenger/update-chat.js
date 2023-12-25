import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import { SSEPush } from "../sse/SSEClient";
import PusherServer from "../../../services/PusherServer";

function ValidateUpdateChat(data) {
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID")
}

export default async function UpdateChat(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "chatID",
        "muted",
        "unread",
        "cleared",
        "latestMessage",
        "lastUpdated"
    ], request.body);

    try {
        ValidateUpdateChat(params);

        const chat = await db.collection("chats").findOneAndUpdate({ accountID: params.accountID, chatID: params.chatID }, {$set: params})
        if (!chat) throw new Error("Chat does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: chat,
            message: "Chat updated successfully."
        })

        const updatedChat = await db.collection("chats").findOne({ accountID: params.accountID, chatID: params.chatID })
        const origin = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const target = (await db.collection("accounts").findOne({ accountID: updatedChat.targetID }))
        let userFriend = (await db.collection("friends").findOne({ accountID: params.accountID, friendID: target.accountID }))
        const now = Date.now()

        const finalChatData = {
            ...updatedChat,
            origin: {
                accountID: origin.accountID,
                firstName: origin.firstName,
                lastName: origin.lastName,
                profileImage: origin.profileImage,
                lastActive: origin.lastActive,
                active: now - origin.lastActive < 300000 ? true : false
            },
            target: {
                accountID: target.accountID,
                firstName: target.firstName,
                lastName: target.lastName,
                profileImage: target.profileImage,
                lastActive: target.lastActive,
                active: now - target.lastActive < 300000 ? true : false
            },
            userFriend: userFriend ? true : false
        }

        await PusherServer.trigger(origin.accountID, `UPDATED_CHAT_${updatedChat.chatID}`, finalChatData)
        await PusherServer.trigger(origin.accountID, `UPDATED_CHAT_LIST`, finalChatData)

        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}