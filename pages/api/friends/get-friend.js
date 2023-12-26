import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriend(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.friendID && !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Invalid: friendID.")
}

async function GetFriend(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "friendID"
    ], request.query);

    try {
        ValidateGetFriend(params);

        let friend = await db.collection("friends").findOne({ friendID: params.friendID });
        const friendSettings = await db.collection("settings").findOne({ accountID: friend.friendID })
        let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: friend.accountID })
        let userLikee = await db.collection("hearts").findOne({ accountID: friend.accountID, userID: params.accountID })
        let chat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: friend.accountID })
        const now = Date.now()

        const responseData = ResponseClient.DBModifySuccess({
            data: {
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
            },
            message: "Friend fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetFriend);