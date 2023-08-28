import CreateEcho, { CreateEchoCallback } from "./create-echo";
import DeleteEcho from "./delete-echo";
import GetEcho from "./get-echo";
import PingEcho, { PingEchoCallback } from "./ping-echo";
import UpdateEcho from "./update-echo";

export default async function EchoSocket(io, socket) {
    socket.on('CREATE_ECHO_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateEcho(data, io)
        io.to(data.accountID).emit(`CREATE_ECHO_RES_${data.serial}`, JSON.stringify(response))
        if (response.success)  await CreateEchoCallback(data, io)
    });

    socket.on('DELETE_ECHO', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteEcho(data, io)
    });

    socket.on('GET_ECHO_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetEcho(data, io)
        io.to(data.accountID).emit(`GET_ECHO_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('PING_ECHO', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await PingEcho(data, io)
        if (response.success) await PingEchoCallback(data, io)
    });

    socket.on('UPDATE_ECHO', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateEcho(data, io)
    });
}