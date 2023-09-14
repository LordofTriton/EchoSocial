import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateChat(data) {
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Missing or Invalid: chatID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function UpdateChat(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "chatID",
        "muted",
        "unread",
        "cleared",
        "latestMessage",
        "lastUpdated"
    ], params);

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

        const finalChatData = {
            ...updatedChat,
            origin: {
                accountID: origin.accountID,
                firstName: origin.firstName,
                lastName: origin.lastName,
                profileImage: origin.profileImage
            },
            target: {
                accountID: target.accountID,
                firstName: target.firstName,
                lastName: target.lastName,
                profileImage: target.profileImage
            },
            userFriend: userFriend ? true : false
        }

        io.to(origin.accountID).emit(`UPDATED_CHAT_${updatedChat.chatID}`, JSON.stringify(finalChatData))
        io.to(origin.accountID).emit(`UPDATED_CHAT_LIST`, JSON.stringify(finalChatData))

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}