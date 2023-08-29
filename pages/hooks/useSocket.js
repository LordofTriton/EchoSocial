import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Cache from '../../services/CacheService';

let socketInstance = null;
let socketRequestCount = 0;
let socketURL = "/api/socket";
// socketURL = "/.netlify/functions/socket"

function getAccountID() {
    const account = Cache.getData("EchoUser");
    return account.accountID;
}

const useSocket = () => {
    const [socket, setSocket] = useState(socketInstance);

    const connectSocket = async () => {
        if (!socketInstance) {
            console.log("Connecting to Socket.")
            await fetch(socketURL)

            socketInstance = io(undefined, {
                path: socketURL
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected.');

                socketInstance.emit("USER_CONNECT", getAccountID());

                setSocket(socketInstance);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
            });
        }
    };

    const  disconnectSocket = () => {
        if (!socketInstance) return;
        console.log(`Disconnecting Socket.`);
        socketInstance.disconnect();
        socketInstance = null;
    };

    const socketRequest = (event, data, callback) => {
        if (!socketInstance) return;
        const serial = String(Math.random() * 100000000);
        socketInstance.emit(`${event}_REQ`, JSON.stringify({...data, serial: serial}))
        socketInstance.on(`${event}_RES_${serial}`, (data) => {
            callback(JSON.parse(data))
            socketInstance.off(`${event}_RES_${serial}`)
        })
    }
    
    const socketEmitter = (event, data) => {
        if (!socketInstance) return;
        socketInstance.emit(event, JSON.stringify(data))
    }
    
    const socketListener = (event, callback) => {
        if (!socketInstance) return;
        socketInstance.on(event, (data) => {
            callback(JSON.parse(data))
        })
    }

    const socketDeafener = (event) => {
        if (!socketInstance) return;
        socketInstance.off(event)
    }

    useEffect(() => {
        setSocket(socketInstance)
    }, [socketInstance])

    useEffect(() => {
        if (!socketInstance) connectSocket();

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
                socketInstance = null;
                console.log('Socket disconnected on unmount');
            }
        };
    }, []);

    return { socket, socketMethods: {
        socketEmitter,
        socketListener,
        socketDeafener,
        socketRequest,
        connectSocket,
        disconnectSocket
    } };
};

export default useSocket;

/*

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Cache from '../../services/CacheService';

let socket;

function getActiveUser() {
    return Cache.getData("EchoUser");
}

async function connectSocket() {
    if (!socket) {
        console.log("Connecting Socket.")
        await fetch(`/api/socket`)

        const newSocket = io(undefined, {
            path: `/api/socket`
        });

        newSocket.emit("USER_CONNECT", getActiveUser().accountID);

        socket = newSocket;
    }
};

async function getSocket() {
    if (!socket) await connectSocket()
    return socket
}

async function socketRequest(event, data, callback) {
    const socket = await getSocket()
    socket.emit(`${event}_REQ`, JSON.stringify(data))
    socket.on(`${event}_RES`, (data) => {
        callback(JSON.parse(data))
        socket.off(`${event}_RES`)
    })
}

async function socketEmitter(event, data) {
    const socket = await getSocket()
    socket.emit(event, JSON.stringify(data))
}

async function socketListener(event, callback) {
    const socket = await getSocket()
    socket.on(event, (data) => {
        callback(JSON.parse(data))
    })
}

function disconnectSocket() {
    if (socket) {
        console.log(`Disconnecting Socket.`);
        socket.disconnect();
        socket = null;
    }
};

export default function useSocket() {
    const [userSocket, setUserSocket] = useState(null)

    useEffect(() => {
        const updateSocket = async () => {
            const us = await getSocket()
            setUserSocket(us)
        }
        if (!userSocket) updateSocket()
    }, [socket])

    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, [])

    return {
        socket: userSocket,
        socketMethods: { socketRequest, socketEmitter, socketListener }
    }
}



function useSocket() {
    const [socket, setSocket] = useState(null);

    const connectSocket = async (accountID) => {
        if (!Object.keys(sockets).includes(accountID)) {
            if (!socket) {
                console.log("Connecting to Socket.")
                await fetch("/api/socket")
            }

            const newSocket = io(undefined, {
                path: "/api/socket"
            });

            newSocket.emit("USER_CONNECT", accountID);

            sockets[accountID] = newSocket;
            setSocket(newSocket);
        } else {
            setSocket(sockets[accountID]);
        }
    };

    const getSocket =  async (accountID) => {
        if (!Object.keys(sockets).includes(accountID)) await connectSocket(accountID)
        return sockets[accountID]
    }

    const socketRequest = (socket, event, data, callback) => {
        socket.emit(`${event}_REQ`, JSON.stringify(data))
        socket.on(`${event}_RES`, (data) => {
            callback(JSON.parse(data))
            socket.off(`${event}_RES`)
        })
    }

    const socketEmitter = (socket, event, data) => (
        socket.emit(event, JSON.stringify(data))
    )

    const socketListener = (socket, event, callback) => {
        socket.on(event, (data) => {
            callback(JSON.parse(data))
        })
    }

    // useEffect(() => {
    //     return () => {
    //         if (socket) {
    //             socket[]
    //             socket.disconnect();
    //         }
    //     };
    // }, [socket]);

    return { socket, socketMethods: {
        connectSocket,
        getSocket,
        socketRequest,
        socketEmitter,
        socketListener
    } };
}

export default useSocket;

*/