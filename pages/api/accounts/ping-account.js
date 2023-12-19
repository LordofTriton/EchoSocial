import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateNotification from "../notifications/create-notification";

function ValidatePingAccount(data) {
    if (!data.accountID || !ParamValidator.isValidObjectID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (data.follow && !ParamValidator.isValidAccountID(data.follow)) throw new Error("Missing or Invalid: follow")
    if (data.unfollow && !ParamValidator.isValidAccountID(data.unfollow)) throw new Error("Missing or Invalid: unfollow")
    if (Object.keys(data).length > 2) throw new Error("Invalid number of operations.")
    if (data.follow && (data.follow === data.accountID)) throw new Error("You can't follow yourself :)")
    if (data.unfollow && (data.unfollow === data.accountID)) throw new Error("You can't unfollow yourself :)")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function PingAccounts (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "follow",
        "unfollow"
    ], request.body);

    try {
        ValidatePingAccount(params);

        let filter = { accountID: params.accountID }

        let operation;
        if (params.follow) operation = { $push: { following: params.follow } }
        if (params.unfollow) operation = { $pull: { following: params.unfollow } }

        const account = await db.collection("accounts").findOneAndUpdate(filter, operation)
        if (!account) throw new Error("Account does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: account,
            message: "Account updated successfully."
        })
        response.json(responseData);
        
        response.once("finish", async () => {
            await PingAccountCallback(params, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function PingAccountCallback(params, request) {
    const { db } = await getDB();
    const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
    if (params.follow) {
        await db.collection("accounts").updateOne({ accountID: params.follow }, { $push: { followers: params.accountID } })

        await axios.post(request.headers.origin + "/api/notifications/create-notification", {
            accountID: params.follow,
            content: `${userAccount.firstName} ${userAccount.lastName} followed you! Click here to view their profile.`,
            image: userAccount.profileImage.url,
            clickable: true,
            redirect: `/user/${userAccount.accountID}`
        })
        
        const follower = await db.collection("accounts").findOne({ accountID: params.accountID })
        const followee = await db.collection("accounts").findOne({ accountID: params.follow })
        if (follower.followers.includes(params.follow) && followee.followers.includes(params.accountID)) {
            await axios.post(request.headers.origin + "/api/notifications/create-notification", {
                accountID: follower.accountID,
                content: `You are now friends with ${followee.firstName} ${followee.lastName}.`,
                image: followee.profileImage.url,
                clickable: true,
                redirect: `/user/${followee.accountID}`
            })
            await axios.post(request.headers.origin + "/api/notifications/create-notification", {
                accountID: followee.accountID,
                content: `${follower.firstName} ${follower.lastName} followed you! You are now friends. Click to view their profile.`,
                image: follower.profileImage.url,
                clickable: true,
                redirect: `/user/${follower.accountID}`
            })
        }

    }
    if (params.unfollow) await db.collection("accounts").updateOne({ accountID: params.unfollow }, { $pull: { followers: params.accountID } })

}