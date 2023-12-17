import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import CreateMember from "../community-members/create-community-member";
import DeleteApplication from "./delete-community-application";
import GetCommunity from "../communities/get-community";
import CreateNotification from "../notifications/create-notification";

function ValidatePingApplication(data) {
    if (!data.applicationID || !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Missing or Invalid: applicationID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function PingCommunityApplications (request, response) {
    const { db } = await getDB();
    let params = parseParams([
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

        
        await axios.post(request.headers.origin + "/api/community-applications/delete-community-application", {
            accountID: application.accountID,
            applicationID: params.applicationID
        })

        if (params.approve) {
            await axios.post(request.headers.origin + "/api/community-members/create-community-member", {
                accountID: application.accountID,
                communityID: application.communityID
            })
        }

        await axios.post(request.headers.origin + "/api/notifications/create-notification", {
            accountID: params.userID,
            content: `An admin ${params.approve ? "approved" : params.deny ? "denied" : "viewed"} your application to join the ${community.displayName} community.`,
            image: community.profileImage.url,
            clickable: params.approve ? true : false,
            redirect: params.approve ? `/communities/${community.communityID}` : ""
        })

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