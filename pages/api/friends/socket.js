import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateFriend, { CreateFriendCallback } from "./create-friend";
import DeleteFriend from "./delete-friend";
import GetFriend from "./get-friend";
import GetFriends from "./get-friends";

export default async function FriendSocket(io, socket) {
    socket.on('CREATE_FRIEND_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CreateFriend(data, io)
        io.to(data.accountID).emit(`CREATE_FRIEND_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateFriendCallback(data, io)
    });

    socket.on('DELETE_FRIEND', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteFriend(data, io)
    });

    socket.on('GET_FRIEND_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetFriend(data, io)
        io.to(data.accountID).emit(`GET_FRIEND_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_FRIENDS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetFriends(data, io)
        io.to(data.accountID).emit(`GET_FRIENDS_RES_${data.serial}`, JSON.stringify(response))
    });
}