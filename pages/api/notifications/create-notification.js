import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateCreateNotification(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.content || data.content.length < 5) throw new Error("Missing or Invalid: content.")
    if (!data.image || data.image.length < 5) throw new Error("Missing or Invalid: image.")
    if (data.redirect && data.redirect.length < 5) throw new Error("Invalid: redirect.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateNotification(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "content",
        "image",
        "clickable",
        "redirect"
    ], params);

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

        if (io) io.to(params.accountID).emit("NEW_NOTIFICATION", JSON.stringify(notificationData))

        const responseData = ResponseClient.DBModifySuccess({
            data: createNotificationResponse,
            message: "Notification created successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}