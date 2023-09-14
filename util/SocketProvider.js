import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect } from 'react';
import useSocket from '../pages/hooks/useSocket';

const SocketContext = createContext();
const authLess = ["/login", "/signup", "/password-reset"]

export const SocketProvider = ({ children }) => {
    const socketProps = useSocket();
    const router = useRouter();

    useEffect(() => {
        const renewSocket = async () => {
            if (socketProps.socket) {
                socketProps.socketMethods.disconnectSocket();
                if (!authLess.includes(router.route)) await socketProps.socketMethods.connectSocket();
            }
        }
        renewSocket()
    }, [router.route])

    return (
        <SocketContext.Provider value={socketProps}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    return useContext(SocketContext);
};