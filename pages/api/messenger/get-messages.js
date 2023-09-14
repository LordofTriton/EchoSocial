import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetMessages(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.messageID && !ParamValidator.isValidObjectID(data.messageID)) throw new Error("Invalid: messageID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetMessages(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "messageID",
        "chatID",
        "filter",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetMessages(params);
        
        const userChat = (await db.collection("chats").findOne({ accountID: params.accountID, chatID: params.chatID }))

        const filters = {
            datetime: { $gt: userChat.cleared }
        }
        if (params.messageID) filters.messageID = params.messageID;
        if (params.chatID) filters.chatID = params.chatID;
        if (params.filter) filters.$or = [{ "content.text": { $regex: params.filter, $options: 'i' } }]

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchMessagesResponse = await db.collection("messages").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const messageCount = await db.collection("messages").countDocuments(filters);
        if (fetchMessagesResponse.length < 1) fetchMessagesResponse = [];

        let messageData = []
        for (let message of fetchMessagesResponse) {
            const user = (await db.collection("accounts").findOne({ accountID: message.accountID }))

            const finalMessageData = {
                ...message,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            messageData.push(finalMessageData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: messageData.reverse(),
            message: "Messages fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: messageCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}