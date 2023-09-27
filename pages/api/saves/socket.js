import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateSave from "./create-save";
import DeleteSave from "./delete-save";
import GetSaves from "./get-saves";

export default async function SaveSocket(io, socket) {
    socket.on('CREATE_SAVE_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CreateSave(data, io)
        io.to(data.accountID).emit(`CREATE_SAVE_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_SAVE', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteSave(data, io)
    });

    socket.on('GET_SAVES_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetSaves(data, io)
        io.to(data.accountID).emit(`GET_SAVES_RES_${data.serial}`, JSON.stringify(response))
    });
}