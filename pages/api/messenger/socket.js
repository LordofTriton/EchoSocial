import CreateChat, { CreateChatCallback } from "./create-chat";
import CreateMessage, { CreateMessageCallback } from "./create-message";
import DeleteChat from "./delete-chat";
import GetChat from "./get-chat";
import GetChats from "./get-chats";
import GetMessages from "./get-messages";
import SearchChats from "./search-chats";
import UpdateChat from "./update-chat";
import UpdateMessage from "./update-message";

export default async function ChatSocket(io, socket) {
    socket.on('CREATE_CHAT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateChat(data, io)
        io.to(data.accountID).emit(`CREATE_CHAT_RES_${data.serial}`, JSON.stringify(response))
    });
    
    socket.on('CREATE_MESSAGE_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateMessage(data, io)
        io.to(data.accountID).emit(`CREATE_MESSAGE_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateMessageCallback(data, io)
    });

    socket.on('DELETE_CHAT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteChat(data, io)
    });

    socket.on('GET_CHAT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetChat(data, io)
        io.to(data.accountID).emit(`GET_CHAT_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_CHATS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetChats(data, io)
        io.to(data.accountID).emit(`GET_CHATS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_MESSAGES_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetMessages(data, io)
        io.to(data.accountID).emit(`GET_MESSAGES_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('SEARCH_CHATS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await SearchChats(data, io)
        io.to(data.accountID).emit(`SEARCH_CHATS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('UPDATE_CHAT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateChat(data, io)
    });

    socket.on('UPDATE_MESSAGE', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateMessage(data, io)
    });
}