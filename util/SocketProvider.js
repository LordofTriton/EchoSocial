import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import useSSE from '../pages/hooks/useSocket';

const SSEContext = createContext();
const authLess = ["/login", "/signup", "/password-reset"]

export const SSEProvider = ({ children }) => {
    const sseProps = useSSE();
    const router = useRouter();

    useEffect(() => {
        const renewSSE = async () => {
            if (sseProps.sse) {
                sseProps.disconnectSSE();
                if (!authLess.includes(router.route)) await sseProps.connectSSE();
            }
        }
        renewSSE()
    }, [router.route])

    return (
        <SSEContext.Provider value={sseProps}>
            {children}
        </SSEContext.Provider>
    );
};

export const useSSEContext = () => {
    return useContext(SSEContext);
};