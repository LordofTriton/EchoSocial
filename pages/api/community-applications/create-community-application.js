import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import AppConfig from "../../../util/config";

function ValidateCreateApplication(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
}

export default async function CreateCommunityApplication (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID"
    ], request.body);

    try {
        ValidateCreateApplication(params)

        const applicationData = {
            applicationID: IDGenerator.GenerateApplicationID(),
            accountID: params.accountID,
            communityID: params.communityID
        }

        const createApplicationResponse = await db.collection("applications").insertOne(applicationData)
        if (createApplicationResponse.errors) throw new Error("An error occured when creating application.");

        const applicationUser = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const result = {
            ...applicationData,
            firstName: applicationUser.firstName,
            lastName: applicationUser.lastName,
            profileImage: applicationUser.profileImage
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Application created successfully."
        })
        
        response.json(responseData);
        
        response.once("finish", async () => {
            await CreateApplicationCallback(params, AppConfig.getHost(request))
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function CreateApplicationCallback(params, reqOrigin) {
    const { db } = await getDB();
    const user = await db.collection("accounts").findOne({ accountID: params.accountID });
    const admins = await db.collection("members").find({ 
        communityID: params.communityID, 
        $or: [ { role: "admin" }, { role: "moderator" } ] 
    }).toArray()
    for (let admin of admins) {
        await axios.post(reqOrigin + "/api/notifications/create-notification", {
            accountID: admin.accountID,
            content: `${user.firstName} ${user.lastName} applied to join your community. Click to view.`,
            image: user.profileImage.url,
            clickable: true,
            redirect: `/communities/${params.communityID}/settings/applications`
        })
    }
}