import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateNotification from "./create-notification";
import DeleteNotification from "./delete-notification";
import GetNotifications from "./get-notifications";
import UpdateNotification from "./update-notification";

export default async function NotificationSocket(io, socket) {
    socket.on('CREATE_NOTIFICATION_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CreateNotification(data, io)
        io.to(data.accountID).emit(`CREATE_NOTIFICATION_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_NOTIFICATION', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteNotification(data, io)
    });

    socket.on('GET_NOTIFICATIONS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetNotifications(data, io)
        io.to(data.accountID).emit(`GET_NOTIFICATIONS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('UPDATE_NOTIFICATION', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await UpdateNotification(data, io)
    });
}