
import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import DeleteMember from "./delete-community-member";
import CreateBlacklist from "../blacklist/create-blacklist";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidateBlacklistMember(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID.")
}

async function BanCommunityMember (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID",
        "userID"
    ], request.body);

    try {
        ValidateBlacklistMember(params);
        const authUserMember = await db.collection("members").findOne({
            accountID: params.accountID,
            communityID: params.communityID
        })
        if (!authUserMember || authUserMember.role === "member") throw new Error("You are unauthorised to perform this action.")

        const community = await db.collection("communities").findOne({ communityID: params.communityID })

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Member updated successfully."
        })
        response.json(responseData);

        response.once("finish", async () => {
            await axios.delete(AppConfig.HOST + `/api/community-members/delete-community-member?accountID=${params.accountID}&userID=${params.userID}&communityID=${params.communityID}`, { headers: { Authorization: `Bearer ${authToken}` } })
            await axios.post(AppConfig.HOST + "/api/blacklists/create-blacklist", {
                accountID: params.accountID,
                blocker: params.communityID,
                blockee: params.userID,
                blockeeType: "user"
            }, { headers: { Authorization: `Bearer ${authToken}` } })
            await axios.post(AppConfig.HOST + "/api/notifications/create-notification", {
                accountID: params.userID,
                content: `You have been kicked and banned from the ${community.displayName} community.`,
                image: community.profileImage.url,
                clickable: false,
                redirect: ""
            }, { headers: { Authorization: `Bearer ${authToken}` } })
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(BanCommunityMember);