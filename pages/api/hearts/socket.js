import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateHeart, { CreateHeartCallback } from "./create-heart";
import DeleteHeart from "./delete-heart";
import GetFriends from "./get-friends";
import GetHearts from "./get-hearts";

export default async function HeartSocket(io, socket) {
    socket.on('CREATE_HEART', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CreateHeart(data, io)
        if (response.success) await CreateHeartCallback(data, io)
    });

    socket.on('DELETE_HEART', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteHeart(data, io)
    });

    socket.on('GET_HEARTS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetHearts(data, io)
        io.to(data.accountID).emit(`GET_HEARTS_RES_${data.serial}`, JSON.stringify(response))
    });
}