import CreateSettings from "./create-settings";
import DeleteSettings from "./delete-settings";
import GetSettings from "./get-settings";
import UpdateSettings from "./update-settings";

export default async function SettingsSocket(io, socket) {
    socket.on('CREATE_SETTINGS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateSettings(data, io)
        io.to(data.accountID).emit(`CREATE_SETTINGS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_SETTINGS', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteSettings(data, io)
    });

    socket.on('GET_SETTINGS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetSettings(data, io)
        io.to(data.accountID).emit(`GET_SETTINGS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('UPDATE_SETTINGS', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateSettings(data, io)
    });
}