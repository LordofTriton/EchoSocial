import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetChats(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.chatID && !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Invalid: chatID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetChats(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "targetID",
        "chatID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetChats(params);

        const filters = { accountID: params.accountID };
        if (params.chatID) filters.chatID = params.chatID;
        if (params.targetID) filters.targetID = params.targetID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchChatsResponse = await db.collection("chats").find(filters).sort({ lastUpdated: 1 }).skip(skip).limit(pagination.pageSize).toArray();
        const chatCount = await db.collection("chats").countDocuments(filters);
        if (fetchChatsResponse.length < 1) fetchChatsResponse = [];

        let chatData = []
        for (let chat of fetchChatsResponse) {
            const origin = (await db.collection("accounts").findOne({ accountID: chat.accountID }))
            const target = (await db.collection("accounts").findOne({ accountID: chat.targetID }))
            const userFriend = await db.collection("friends").findOne({ accountID: params.accountID, friendID: target.accountID })
            const now = Date.now()

            const finalChatData = {
                ...chat,
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
            chatData.push(finalChatData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: chatData.reverse(),
            message: "Chats fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: chatCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}