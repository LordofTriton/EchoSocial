import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteNotification(data) {
    if (!data.notificationID || !ParamValidator.isValidObjectID(data.notificationID)) throw new Error("Missing or Invalid: notificationID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteNotification(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "notificationID"
    ], params);

    try {
        ValidateDeleteNotification(params)

        const deleteNotificationResponse = await db.collection("notifications").deleteOne({ notificationID: params.notificationID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteNotificationResponse,
            message: "Notification deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}