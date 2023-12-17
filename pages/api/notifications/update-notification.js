import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateNotification(data) {
    if (data.notificationID && !ParamValidator.isValidObjectID(data.notificationID)) throw new Error("Invalid: notificationID.")
    if (data.accountID && !ParamValidator.isValidObjectID(data.accountID)) throw new Error("Invalid: accountID.")
    if (!data.notificationID && !data.accountID) throw new Error("Error: notificationID or accountID is required.")
    if (!data.status || !ParamValidator.isValidNotificationStatus(data.status)) throw new Error("Missing or Invalid: status.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function UpdateNotification(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "notificationID",
        "status"
    ], request.body);

    try {
        ValidateUpdateNotification(params);

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;
        if (params.notificationID) filters.notificationID = params.notificationID;

        const notification = await db.collection("notifications").updateMany(filters, {$set: { status: params.status }})
        if (!notification) throw new Error("Notification does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: notification,
            message: "Notification updated successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}