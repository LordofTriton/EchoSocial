import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateCreateChat(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.targetID || !ParamValidator.isValidAccountID(data.targetID)) throw new Error("Missing or Invalid: targetID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateChat(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "targetID",
        "lastestMessage"
    ], params);

    try {
        ValidateCreateChat(params)
        let chatID = IDGenerator.GenerateChatID()

        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)
        if (!friendsList.includes(params.targetID)) throw new Error("You cannot open a chat with this user.")

        let userChat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: params.targetID })
        let targetChat = await db.collection("chats").findOne({ accountID: params.targetID, targetID: params.accountID })

        if (userChat) throw new Error("This chat already exists.")
        if (targetChat) chatID = targetChat.chatID;

        const chatData = {
            chatID,
            accountID: params.accountID,
            targetID: params.targetID,
            latestMessage: params.latestMessage ? params.latestMessage : null,
            muted: false,
            unread: 0,
            cleared: Date.now(),
            lastUpdated: Date.now()
        }

        await db.collection("chats").insertOne(chatData)
        const createdChat = await db.collection("chats").findOne({ chatID })
        const origin = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const target = (await db.collection("accounts").findOne({ accountID: createdChat.targetID }))
        let userFriend = (await db.collection("friends").findOne({ accountID: params.accountID, friendID: target.accountID }))
        const now = Date.now()

        const finalChatData = {
            ...createdChat,
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

        io.to(params.accountID).emit(`UPDATED_CHAT`, JSON.stringify(finalChatData))

        const responseData = ResponseClient.DBModifySuccess({
            data: createdChat,
            message: "Chat created successfully."
        })

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}