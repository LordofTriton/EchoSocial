
import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import DeleteMember from "./delete-community-member";
import CreateBlacklist from "../blacklist/create-blacklist";
import CreateNotification from "../notifications/create-notification";

function ValidateBlacklistMember(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function BlacklistMember(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID",
        "userID"
    ], params);

    try {
        ValidateBlacklistMember(params);
        const authUserMember = await db.collection("members").findOne({
            accountID: params.accountID,
            communityID: params.communityID,
            userID: params.accountID
        })
        if (authUserMember && authUserMember.role === "member") throw new Error("You are unauthorised to perform this action.")

        await DeleteMember({
            accountID: params.accountID,
            userID: params.userID,
            communityID: params.communityID
        })
        await CreateBlacklist({
            accountID: params.accountID,
            blocker: params.communityID,
            blockee: params.userID,
            blockeeType: "user"
        })

        const community = await db.collection("communities").findOne({ communityID: params.communityID })
        await CreateNotification({
            accountID: params.userID,
            content: `You have been banned from the ${community.displayName} community.`,
            image: community.profileImage.url,
            clickable: false,
            redirect: ""
        }, io)

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Member updated successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}