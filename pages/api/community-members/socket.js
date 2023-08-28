import BlacklistMember from "./ban-community-member";
import CreateMember, { CreateMemberCallback } from "./create-community-member";
import DeleteMember from "./delete-community-member";
import GetMember from "./get-community-member";
import GetMembers from "./get-community-members";
import UpdateMember from "./update-community-member";

export default async function MemberSocket(io, socket) {
    socket.on('CREATE_MEMBER_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateMember(data, io)
        io.to(data.accountID).emit(`CREATE_MEMBER_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateMemberCallback(data, io)
    });

    socket.on('DELETE_MEMBER', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteMember(data, io)
    });

    socket.on('GET_MEMBER_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetMember(data, io)
        io.to(data.accountID).emit(`GET_MEMBER_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_MEMBERS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetMembers(data, io)
        io.to(data.accountID).emit(`GET_MEMBERS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('BAN_MEMBER', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await BlacklistMember(data, io)
    });

    socket.on('UPDATE_MEMBER', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateMember(data, io)
    });
}