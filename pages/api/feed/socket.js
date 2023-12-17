import Feed from "./get-feed";
import UpdateAccount from "../accounts/update-account";
import SocketAuth from "../socket/auth";
import CommunitiesFeed from "./get-communities-feed";
import CommunityFeed from "./get-community-feed";
import UserFeed from "./get-user-feed";

export default async function FeedSocket(io, socket) {
    socket.on('FEED_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await Feed(data, io)
        io.to(data.accountID).emit(`FEED_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('USER_FEED_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await UserFeed(data, io)
        io.to(data.accountID).emit(`USER_FEED_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('COMMUNITY_FEED_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CommunityFeed(data, io)
        io.to(data.accountID).emit(`COMMUNITY_FEED_RES_${data.serial}`, JSON.stringify(response))
    });

    socket.on('COMMUNITIES_FEED_REQ', async (data) => {
        if (!data) return;
        else data = JSON.parse(data)
        const authorized = await SocketAuth(data)
        if (!authorized) return;
        const response = await CommunitiesFeed(data, io)
        io.to(data.accountID).emit(`COMMUNITIES_FEED_RES_${data.serial}`, JSON.stringify(response))
    });
}