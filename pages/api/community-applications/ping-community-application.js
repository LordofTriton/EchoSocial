import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateMember from "../community-members/create-community-member";
import DeleteApplication from "./delete-community-application";
import GetCommunity from "../communities/get-community";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidatePingApplication(data) {
    if (!data.applicationID || !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Missing or Invalid: applicationID")
}

async function PingCommunityApplications (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID",
        "applicationID",
        "approve",
        "deny"
    ], request.body);

    try {
        ValidatePingApplication(params);
        const authUserMember = await db.collection("members").findOne({
            accountID: params.accountID,
            communityID: params.communityID
        })
        if (!authUserMember || authUserMember.role === "member") throw new Error("You are unauthorised to perform this action.")
        const application = await db.collection("applications").findOne({ applicationID: params.applicationID })
        const community = await db.collection("communities").findOne({ communityID: params.communityID });

        await axios.delete(AppConfig.HOST + `/api/community-applications/delete-community-application?accountID=${application.accountID}&applicationID=${params.applicationID}`, { headers: { Authorization: `Bearer ${authToken}` } })

        if (params.approve) {
            await axios.post(AppConfig.HOST + "/api/community-members/create-community-member", {
                accountID: application.accountID,
                communityID: application.communityID
            }, { headers: { Authorization: `Bearer ${authToken}` } })
        }

        await axios.post(AppConfig.HOST + "/api/notifications/create-notification", {
            accountID: params.userID,
            content: `An admin ${params.approve ? "approved" : params.deny ? "denied" : "viewed"} your application to join the ${community.displayName} community.`,
            image: community.profileImage.url,
            clickable: params.approve ? true : false,
            redirect: params.approve ? `/communities/${community.communityID}` : ""
        }, { headers: { Authorization: `Bearer ${authToken}` } })

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Application updated successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(PingCommunityApplications);