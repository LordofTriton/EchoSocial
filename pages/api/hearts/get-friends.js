import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriends(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.userID || !ParamValidator.isValidAccountID(data.userID)) throw new Error("Missing or Invalid: userID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function GetFriends(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "userID"
    ], params);

    try {
        ValidateGetFriends(params);

        const filter = {};
        if (params.userID) filter.accountID = params.userID;
        else filter.accountID = params.accountID;

        let friendsList = (await db.collection("hearts").find({
            $or: [
                { accountID: filter.accountID, userID: { $exists: true } },
                { userID: filter.accountID }
            ]
        }).toArray())

        let friends = []
        let friendsIDs = friendsList.filter((friend) => friendsList.map((item) => item.userID).includes(friend.accountID)).map((obj) => obj.accountID).filter((x) => x !== filter.accountID)
        for (let friendID of friendsIDs) {
            const friend = await db.collection("accounts").findOne({ accountID: friendID })
            let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: friend.accountID })
            let userLikee = await db.collection("hearts").findOne({ accountID: friend.accountID, userID: params.accountID })
            friends.push({
                accountID: friend.accountID,
                firstName: friend.firstName,
                lastName: friend.lastName,
                profileImage: friend.profileImage,
                profileCover: friend.profileCover,
                nickname: friend.nickname,
                userLiked: userLiked ? true : false,
                userLikee: userLikee ? true : false,
                userFriend: userLiked && userLikee ? true : false
            })
        } 

        const responseData = ResponseClient.GenericSuccess({
            data: friends,
            message: "Friends fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}