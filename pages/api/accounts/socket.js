import SocketAuth from "../socket/auth";
import CreateAccount from "./create-account";
import DeleteAccount from "./delete-account";
import GetAccount from "./get-account";
import GetAccounts from "./get-accounts";
import PingAccount, { PingAccountCallback } from "./ping-account";
import UpdateAccount, { UpdateAccountCallback } from "./update-account";

export default async function AccountSocket(io, socket) {
    socket.on('CREATE_ACCOUNT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateAccount(data, io)
        io.to(data.accountID).emit(`CREATE_ACCOUNT_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('DELETE_ACCOUNT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteAccount(data, io)
    });

    socket.on('GET_ACCOUNT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetAccount(data, io)
        io.to(data.accountID).emit(`GET_ACCOUNT_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_ACCOUNTS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await GetAccounts(data, io)
        io.to(data.accountID).emit(`GET_ACCOUNTS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('PING_ACCOUNT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await PingAccount(data, io)
        if (response.success) await PingAccountCallback(data, io)
    });

    socket.on('UPDATE_ACCOUNT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        await UpdateAccount(data, io)
        await UpdateAccountCallback(data, io)
    });
}