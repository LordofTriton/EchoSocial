import CreateApplication, { CreateApplicationCallback } from "./create-community-application";
import DeleteApplication from "./delete-community-application";
import GetApplications from "./get-community-applications";
import PingApplication from "./ping-community-application";

export default async function ApplicationSocket(io, socket) {
    socket.on('CREATE_APPLICATION_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateApplication(data, io)
        io.to(data.accountID).emit(`CREATE_APPLICATION_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateApplicationCallback(data, io)
    });

    socket.on('DELETE_APPLICATION', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteApplication(data, io)
    });

    socket.on('GET_APPLICATIONS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetApplications(data, io)
        io.to(data.accountID).emit(`GET_APPLICATIONS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('PING_APPLICATION', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await PingApplication(data, io)
    });
}