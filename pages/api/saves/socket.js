import CreateSave from "./create-save";
import DeleteSave from "./delete-save";
import GetSaves from "./get-saves";

export default async function SaveSocket(io, socket) {
    socket.on('CREATE_SAVE_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateSave(data, io)
        io.to(data.accountID).emit(`CREATE_SAVE_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_SAVE', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteSave(data, io)
    });

    socket.on('GET_SAVES_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetSaves(data, io)
        io.to(data.accountID).emit(`GET_SAVES_RES_${data.serial}`, JSON.stringify(response))
    });
}