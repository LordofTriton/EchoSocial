import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CreateNode from "./create-node";
import DeleteNode from "./delete-node";
import GetNodes from "./get-nodes";

export default async function NodeSocket(io, socket) {
    socket.on('CREATE_NODE_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CreateNode(data, io)
        io.to(data.accountID).emit(`CREATE_NODE_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_NODE', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await DeleteNode(data, io)
    });

    socket.on('GET_NODES_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetNodes(data, io)
        io.to(data.accountID).emit(`GET_NODES_RES_${data.serial}`, JSON.stringify(response))
    });
}