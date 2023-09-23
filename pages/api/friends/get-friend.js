import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriend(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.friendID && !ParamValidator.isValidObjectID(data.friendID)) throw new Error("Invalid: friendID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetFriend(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "friendID"
    ], params);

    try {
        ValidateGetFriend(params);

        let friend = await db.collection("friends").findOne({ friendID: params.friendID });
        const friendSettings = await db.collection("settings").findOne({ accountID: friend.friendID })
        let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: friend.accountID })
        let userLikee = await db.collection("hearts").findOne({ accountID: friend.accountID, userID: params.accountID })
        let chat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: friend.accountID })

        const responseData = ResponseClient.DBModifySuccess({
            data: {
                accountID: friend.accountID,
                firstName: friend.firstName,
                lastName: friend.lastName,
                profileImage: friend.profileImage,
                profileCover: friend.profileCover,
                nickname: friend.nickname,
                settings: friendSettings,
                userChat: chat ? chat : null,
                userLiked: userLiked ? true : false,
                userLikee: userLikee ? true : false,
                userFriend: userLiked && userLikee ? true : false
            },
            message: "Friend fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}