import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetNotification(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.status && !ParamValidator.isValidNotificationStatus(data.status)) throw new Error("Invalid: status.")
}

async function GetNotifications(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "status",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetNotification(params);

        const filters = { accountID: params.accountID }
        if (params.status) filters.status = params.status;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchNotificationResponse = await db.collection("notifications").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const notificationCount = await db.collection("notifications").countDocuments(filters);
        if (!fetchNotificationResponse) fetchNotificationResponse = []

        const responseData = ResponseClient.DBFetchSuccess({
            data: fetchNotificationResponse,
            message: "Notification(s) fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: notificationCount,
            pagination: true
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetNotifications);