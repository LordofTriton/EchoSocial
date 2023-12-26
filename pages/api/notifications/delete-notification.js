import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteNotification(data) {
    if (!data.notificationID || !ParamValidator.isValidObjectID(data.notificationID)) throw new Error("Missing or Invalid: notificationID.")
}

async function DeleteNotification(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "notificationID"
    ], request.query);

    try {
        ValidateDeleteNotification(params)

        const deleteNotificationResponse = await db.collection("notifications").deleteOne({ notificationID: params.notificationID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteNotificationResponse,
            message: "Notification deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(DeleteNotification);