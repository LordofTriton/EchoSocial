import APIClient from "../services/APIClient";

export default async function APICallback(data) {
    if (data.notificationData) {
        await APIClient.post("/notifications/create-notification", data.notificationData)
    }
}