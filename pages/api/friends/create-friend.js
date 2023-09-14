import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import CreateChat from "../messenger/create-chat";

function ValidateCreateFriend(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.friendID || !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Missing or Invalid: friendID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateFriend(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "friendID"
    ], params);

    try {
        ValidateCreateFriend(params)

        await db.collection("friends").insertOne({
            accountID: params.accountID,
            friendID: params.friendID
        })
        await db.collection("friends").insertOne({
            accountID: params.friendID,
            friendID: params.accountID
        })

        const originFriend = await db.collection("friends").findOne({ 
            accountID: params.accountID,
            friendID: params.friendID
        })
        const targetFriend = await db.collection("friends").findOne({ 
            accountID: params.friendID,
            friendID: params.params
        })

        const responseData = ResponseClient.DBModifySuccess({
            data: originFriend,
            message: "Friend created successfully."
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateFriendCallback(params, io) {
    const { db } = await getDB();
    const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
    const friend = await db.collection("accounts").findOne({ accountID: params.friendID })
    
    await CreateNotification({
        accountID: userAccount.accountID,
        content: `You are now friends with ${friend.firstName} ${friend.lastName}.`,
        image: friend.profileImage.url,
        clickable: true,
        redirect: `/user/${friend.accountID}`
    }, io)
    await CreateNotification({
        accountID: friend.accountID,
        content: `${userAccount.firstName} ${userAccount.lastName} liked your page! You are now friends. Click to view their profile.`,
        image: userAccount.profileImage.url,
        clickable: true,
        redirect: `/user/${userAccount.accountID}`
    }, io)
    const userChat = await CreateChat({
        accountID: params.accountID,
        targetID: friend.accountID
    }, io)
    const friendChat = await CreateChat({
        accountID: friend.accountID,
        targetID: params.accountID
    }, io)
    io.to(params.accountID).emit("NEW_FRIEND", JSON.stringify({
        accountID: friend.accountID,
        firstName: friend.firstName,
        lastName: friend.lastName,
        profileImage: friend.profileImage,
        profileCover: friend.profileCover,
        nickname: friend.nickname,
        userChat: friendChat ? friendChat.data : null,
        userLiked: true,
        userLikee: true,
        userFriend: true
    }))
    io.to(params.friendID).emit("NEW_FRIEND", JSON.stringify({
        accountID: userAccount.accountID,
        firstName: userAccount.firstName,
        lastName: userAccount.lastName,
        profileImage: userAccount.profileImage,
        profileCover: userAccount.profileCover,
        nickname: userAccount.nickname,
        userChat: userChat ? userChat.data : null,
        userLiked: true,
        userLikee: true,
        userFriend: true
    }))
}