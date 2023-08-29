import { Server } from 'socket.io';
import NotificationSocket from '../../pages/api/notifications/socket';
import CommentSocket from '../../pages/api/comments/socket';
import FeedSocket from '../../pages/api/feed/socket';
import AccountSocket from '../../pages/api/accounts/socket';
import CommunitySocket from '../../pages/api/communities/socket';
import EchoSocket from '../../pages/api/echoes/socket';
import SettingsSocket from '../../pages/api/settings/socket';
import NodeSocket from '../../pages/api/nodes/socket';
import HeartSocket from '../../pages/api/hearts/socket';
import BlacklistSocket from '../../pages/api/blacklist/socket';
import ApplicationSocket from '../../pages/api/community-applications/socket';
import MemberSocket from '../../pages/api/community-members/socket';

export default async (request, response) => {
    if (!response.socket.server.io) {
        console.log("Socket: Initialized.")
        const io = new Server(response.socket.server, { path: "/api/socket", addTrailingSlash: false, cors: {
                origin: "/",
                methods: ["GET", "POST"],
                transports: ['websocket', 'polling'],
                credentials: true
            },
            allowEIO3: true 
        });

        io.on('connection', (socket) => {
            console.log(`Socket: Client ${socket.id} connected.`);

            socket.on('disconnect', () => {
                console.log(`Socket: Client ${socket.id} disconnected.`);
                socket.leaveAll()
            });

            socket.on('USER_CONNECT', (accountID) => {
                socket.join(accountID)
                console.log(`Socket: User ${accountID} connected.`);
            });

            socket.on('JOIN_ROOM', (room) => {
                socket.join(room)
            });

            socket.on('LEAVE_ROOM', (room) => {
                socket.leave(room)
            });

            AccountSocket(io, socket)
            BlacklistSocket(io, socket)
            CommentSocket(io, socket)
            CommunitySocket(io, socket)
            ApplicationSocket(io, socket)
            MemberSocket(io, socket)
            EchoSocket(io, socket)
            FeedSocket(io, socket)
            HeartSocket(io, socket)
            NodeSocket(io, socket)
            NotificationSocket(io, socket)
            SettingsSocket(io, socket)
        });

        response.socket.server.io = io;
    }
    response.end();
};