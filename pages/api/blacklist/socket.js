import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateBlacklist from "./create-blacklist";
import DeleteBlacklist from "./delete-blacklist";
import GetBlacklists from "./get-blacklist";

export default async function BlacklistSocket(io, socket) {
    socket.on('CREATE_BLACKLIST', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await CreateBlacklist(data, io)
    });

    socket.on('DELETE_BLACKLIST', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteBlacklist(data, io)
    });

    socket.on('GET_BLACKLISTS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetBlacklists(data, io)
        io.to(data.accountID).emit(`GET_BLACKLISTS_RES_${data.serial}`, JSON.stringify(response))
    });
}