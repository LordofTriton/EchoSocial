import CreateHeart, { CreateHeartCallback } from "./create-heart";
import DeleteHeart from "./delete-heart";
import GetFriends from "./get-friends";
import GetHearts from "./get-hearts";

export default async function HeartSocket(io, socket) {
    socket.on('CREATE_HEART', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateHeart(data, io)
        if (response.success) await CreateHeartCallback(data, io)
    });

    socket.on('DELETE_HEART', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteHeart(data, io)
    });

    socket.on('GET_HEARTS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetHearts(data, io)
        io.to(data.accountID).emit(`GET_HEARTS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_FRIENDS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetFriends(data, io)
        io.to(data.accountID).emit(`GET_FRIENDS_RES_${data.serial}`, JSON.stringify(response))
    });
}