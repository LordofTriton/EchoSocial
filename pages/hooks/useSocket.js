import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import CacheService from '../../services/CacheService';

let socketInstance = null;
let socketURL = "/api/socket";

function getAccountID() {
    const account = CacheService.getData("EchoActiveUser");
    return account ? account.accountID : null;
}

function getToken() {
    const token = CacheService.getData("EchoUserToken");
    return token ? token : null;
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
                console.log('Socket disconnected.');
            });
        }
    };

    const  disconnectSocket = () => {
        if (!socketInstance) return;
        console.log(`Disconnecting Socket.`);
        socketInstance.disconnect();
        socketInstance = null;
    };

    const socketRequest = (event, params, callback) => {
        if (!socketInstance) return;
        const payload = { ...params, accountID: getAccountID(), accessToken: getToken() }

        const cachedResponse = CacheService.getData(`${event}_${JSON.stringify(params)}`)
        if (cachedResponse) callback(JSON.parse(cachedResponse))

        const serial = String(Math.random() * 100000000000000);
        socketInstance.emit(`${event}_REQ`, JSON.stringify({...payload, serial: serial}))
        socketInstance.on(`${event}_RES_${serial}`, (data) => {
            callback(JSON.parse(data))
            CacheService.saveData(`${event}_${JSON.stringify(params)}`, data)
            socketInstance.off(`${event}_RES_${serial}`)
        })
    }
    
    const socketEmitter = (event, data) => {
        if (!socketInstance) return;
        const payload = { ...data, accountID: getAccountID(), accessToken: getToken() }
        socketInstance.emit(event, JSON.stringify(payload))
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