import CreateComment, { CreateCommentCallback } from "./create-comment";
import DeleteComment from "./delete-comment";
import GetComment from "./get-comment";
import GetComments from "./get-comments";
import PingComment, { PingCommentCallback } from "./ping-comment";
import UpdateComment from "./update-comment";

export default async function CommentSocket(io, socket) {
    socket.on('CREATE_COMMENT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await CreateComment(data, io)
        io.to(data.accountID).emit(`CREATE_COMMENT_RES_${data.serial}`, JSON.stringify(response))
        if (response.success) await CreateCommentCallback(data, io)
    });

    socket.on('DELETE_COMMENT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await DeleteComment(data, io)
    });

    socket.on('GET_COMMENT_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetComment(data, io)
        io.to(data.accountID).emit(`GET_COMMENT_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('GET_COMMENTS_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await GetComments(data, io)
        io.to(data.accountID).emit(`GET_COMMENTS_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('PING_COMMENT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const response = await PingComment(data, io)
        if (response.success) await PingCommentCallback(data, io)
    });

    socket.on('UPDATE_COMMENT', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        await UpdateComment(data, io)
    });
}