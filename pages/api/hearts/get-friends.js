import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetFriends(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.userID || !ParamValidator.isValidAccountID(data.userID)) throw new Error("Missing or Invalid: userID.")
}

export default async function GetFriends(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "userID"
    ], request.query);

    try {
        ValidateGetFriends(params);

        const filter = {};
        if (params.userID) filter.accountID = params.userID;
        else filter.accountID = params.accountID;

        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)

        let friends = []
        for (let friendID of friendsList) {
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
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}