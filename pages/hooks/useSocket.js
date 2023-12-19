import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import CacheService from '../../services/CacheService';

let eventSource = null;

function getAccountID() {
    const account = CacheService.getData("EchoActiveUser");
    return account ? account.accountID : null;
}

function getToken() {
    const token = CacheService.getData("EchoUserToken");
    return token ? token : null;
}

const useSSE = () => {
    const [sse, setSSE] = useState(eventSource);

    const connectSSE = async () => {
        if (!eventSource) {
            console.log("Connecting to SSE.")
            eventSource = new EventSource(`/api/sse?accountID=${getAccountID()}`);

            eventSource.onerror = (error) => {
                console.error('SSE Error: ', error);
                // eventSource.close();
            };
        }
    };

    const disconnectSSE = () => {
        if (!eventSource) return;
        console.log(`Disconnecting SSE.`);
        eventSource.close();
        eventSource = null;
    };
    
    const sseListener = (header, callback, to, room) => {
        if (!eventSource) return;
        eventSource.addEventListener("message", (event) => {
            console.log(event)
            const payload = JSON.parse(event.data);
            if ((payload.to && to && payload.to === to) || (payload.room && room && payload.room === room)) callback(payload.data)
        })
    }

    const sseDeafener = (header, callback) => {
        if (!eventSource) return;
        eventSource.removeEventListener(header, callback)
    }

    useEffect(() => {
        setSSE(eventSource)
    }, [eventSource])

    useEffect(() => {
        if (!eventSource) connectSSE();

        return () => {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
                console.log('SSE disconnected on unmount');
            }
        };
    }, []);

    return { 
        sse: sse ? sse : null,
        sseListener,
        sseDeafener,
        connectSSE,
        disconnectSSE

    };
};

export default useSSE;