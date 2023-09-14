import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetNotification(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.status && !ParamValidator.isValidNotificationStatus(data.status)) throw new Error("Invalid: status.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetNotifications(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "status",
        "page",
        "pageSize"
    ], params);

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
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}