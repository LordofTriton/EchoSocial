import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriends(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.friendID && !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Invalid: friendID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetFriends(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "userID",
        "friendID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetFriends(params);
        if (!params.userID) params.userID = params.accountID;
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID}] }).toArray()

        const filters = { 
            accountID: params.userID,
            $and: [
                { friendID: { $nin: blacklist.filter((blck) => blck.blocker === params.accountID).map((obj) => obj.blockee) } },
                { friendID: { $nin: blacklist.filter((blck) => blck.blockee === params.accountID).map((obj) => obj.blocker) } } 
            ]
        }
        if (params.friendID) filters.friendID = params.friendID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchFriendsResponse = await db.collection("friends").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const friendCount = await db.collection("friends").countDocuments(filters);
        if (fetchFriendsResponse.length < 1) fetchFriendsResponse = [];

        let friendData = []
        for (let friendUser of fetchFriendsResponse) {
            const friend = await db.collection("accounts").findOne({ accountID: friendUser.friendID })
            const friendSettings = await db.collection("settings").findOne({ accountID: friendUser.friendID })
            let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: friend.accountID })
            let userLikee = await db.collection("hearts").findOne({ accountID: friend.accountID, userID: params.accountID })
            let chat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: friend.accountID })
            const now = Date.now()

            friendData.push({
                accountID: friend.accountID,
                firstName: friend.firstName,
                lastName: friend.lastName,
                profileImage: friend.profileImage,
                profileCover: friend.profileCover,
                nickname: friend.nickname,
                settings: friendSettings,
                lastActive: friend.lastActive,
                active: now - friend.lastActive < 300000 ? true : false,
                userChat: chat ? chat : null,
                userLiked: userLiked ? true : false,
                userLikee: userLikee ? true : false,
                userFriend: userLiked && userLikee ? true : false
            })
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: friendData.reverse(),
            message: "Friends fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: friendCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}