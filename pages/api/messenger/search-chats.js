import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import GetAccounts from "../accounts/get-accounts";
import GetMessages from "./get-messages";

function ValidateSearchChats(data) {
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

export default async function SearchChats(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "filter",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateSearchChats(params);

        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        const friends = await db.collection("accounts").find({
            accountID: { $in: friendsList },
            $or: [
                { firstName: { $regex: params.filter, $options: 'i' } },
                { lastName: { $regex: params.filter, $options: 'i' } }
            ]
        }).skip(skip).limit(pagination.pageSize).toArray();

        let chats = await db.collection("chats").find({
            accountID: params.accountID,
            targetID: { $in: friends.map((friend) => friend.accountID) }
        }).toArray();

        const chatCount = await db.collection("chats").countDocuments({
            accountID: params.accountID,
            targetID: { $in: friends.map((friend) => friend.accountID) }
        });
        if (chats.length < 1) chats = [];

        let chatData = []
        for (let chat of chats) {
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