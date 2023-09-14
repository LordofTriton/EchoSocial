import { getDB } from "../../../util/db/mongodb";
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

export default async function PingApplication(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID",
        "applicationID",
        "approve",
        "deny"
    ], params);

    try {
        ValidatePingApplication(params);
        const authUserMember = await db.collection("members").findOne({
            accountID: params.accountID,
            communityID: params.communityID
        })
        if (!authUserMember || authUserMember.role === "member") throw new Error("You are unauthorised to perform this action.")
        const application = await db.collection("applications").findOne({ applicationID: params.applicationID })
        const community = await db.collection("communities").findOne({ communityID: params.communityID });

        if (params.approve) {
            await CreateMember({
                accountID: application.accountID,
                communityID: application.communityID
            }, io)
            await DeleteApplication({
                accountID: application.accountID,
                applicationID: params.applicationID
            }, io)
            await CreateNotification({
                accountID: application.accountID,
                content: `An admin approved your application to join the ${community.displayName} community.`,
                image: community.profileImage.url,
                clickable: false,
                redirect: `/communities/${community.communityID}`
            }, io)
        } 
        
        if (params.deny) {
            await DeleteApplication({
                accountID: application.accountID,
                applicationID: params.applicationID
            }, io)
            await CreateNotification({
                accountID: application.accountID,
                content: `An admin denied your application to join the ${community.displayName} community.`,
                image: community.profileImage.url,
                clickable: false,
                redirect: ""
            }, io)
        }

        const responseData = ResponseClient.GenericSuccess({
            data: null,
            message: "Application updated successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}