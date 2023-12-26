import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import CreateChat from "../messenger/create-chat";
import { SSEPush } from "../sse/SSEClient";
import PusherServer from "../../../services/PusherServer";
import AppConfig from "../../../util/config";

function ValidateCreateFriend(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.friendID || !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Missing or Invalid: friendID.")
}

async function CreateFriend(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "friendID"
    ], request.body);

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
        
        response.json(responseData);
        
        response.once("finish", async () => {
            await CreateFriendCallback(params, AppConfig.HOST, authToken)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function CreateFriendCallback(params, reqOrigin, authToken) {
    const { db } = await getDB();
    const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
    const friend = await db.collection("accounts").findOne({ accountID: params.friendID })
    
    await axios.post(reqOrigin + "/api/notifications/create-notification", {
        accountID: userAccount.accountID,
        content: `You are now friends with ${friend.firstName} ${friend.lastName}.`,
        image: friend.profileImage.url,
        clickable: true,
        redirect: `/user/${friend.accountID}`
    }, { headers: { Authorization: `Bearer ${authToken}` } })
    await axios.post(reqOrigin + "/api/notifications/create-notification", {
        accountID: friend.accountID,
        content: `${userAccount.firstName} ${userAccount.lastName} liked your page! You are now friends. Click to view their profile.`,
        image: userAccount.profileImage.url,
        clickable: true,
        redirect: `/user/${userAccount.accountID}`
    }, { headers: { Authorization: `Bearer ${authToken}` } })
    const userChat = (await axios.post(reqOrigin + "/api/messenger/create-chat", {
        accountID: params.accountID,
        targetID: friend.accountID
    }, { headers: { Authorization: `Bearer ${authToken}` } })).data;
    const friendChat = (await axios.post(reqOrigin + "/api/messenger/create-chat", {
        accountID: friend.accountID,
        targetID: params.accountID
    }, { headers: { Authorization: `Bearer ${authToken}` } })).data;

    await PusherServer.trigger(params.accountID, `NEW_FRIEND`, {
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
    })

    await PusherServer.trigger(params.friendID, `NEW_FRIEND`, {
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
    })
}

export default authenticate(CreateFriend);