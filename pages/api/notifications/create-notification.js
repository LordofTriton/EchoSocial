import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import PusherServer from "../../../services/PusherServer";

function ValidateCreateNotification(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.content || data.content.length < 5) throw new Error("Missing or Invalid: content.")
    if (!data.image || data.image.length < 5) throw new Error("Missing or Invalid: image.")
    if (data.redirect && data.redirect.length < 5) throw new Error("Invalid: redirect.")
}

async function CreateNotification(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "content",
        "image",
        "clickable",
        "redirect"
    ], request.body);

    try {
        ValidateCreateNotification(params)

        const notificationData = {
            notificationID: IDGenerator.GenerateNotificationID(),
            accountID: params.accountID,
            content: params.content,
            image: params.image,
            clickable: params.clickable,
            redirect: params.redirect,
            datetime: Date.now(),
            status: "unread"
        }

        const createNotificationResponse = await db.collection("notifications").insertOne(notificationData)
        if (createNotificationResponse.errors) throw new Error("An error occured when creating notification.");

        await PusherServer.trigger(params.accountID, "NEW_NOTIFICATION", notificationData)

        const responseData = ResponseClient.DBModifySuccess({
            data: createNotificationResponse,
            message: "Notification created successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(CreateNotification);