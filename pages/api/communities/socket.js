import CreateCommunity, { CreateCommunityCallback } from "./create-community";
import DeleteCommunity from "./delete-community";
import GetCommunity from "./get-community";
import GetCommunities from "./get-communities";
import UpdateCommunity, { UpdateCommunityCallback } from "./update-community";

export default async function CommunitySocket(io, socket) {
    socket.on('CREATE_COMMUNITY_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateCommunity(data, io)
        io.to(data.accountID).emit(`CREATE_COMMUNITY_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateCommunityCallback(data, io, response.data)
    });

    socket.on('DELETE_COMMUNITY', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteCommunity(data, io)
    });

    socket.on('GET_COMMUNITY_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetCommunity(data, io)
        io.to(data.accountID).emit(`GET_COMMUNITY_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_COMMUNITIES_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetCommunities(data, io)
        io.to(data.accountID).emit(`GET_COMMUNITIES_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('UPDATE_COMMUNITY', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateCommunity(data, io)
        await UpdateCommunityCallback(data, io)
    });
}