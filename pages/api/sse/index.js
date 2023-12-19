import { createSession, createChannel } from "better-sse";

let sseClients = []

export default async (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none')

    const client = sseClients.find((client) => client.accountID === targetID);
    if (!client) {
        sseClients.push({accountID: req.query.accountID, sse: res});
        
        console.log(`SSE: User ${req.query.accountID} connected!`)

        SSEPush("SSE: User connected.", req.query.accountID);
    } else SSEPush("SSE: User already connected.", req.query.accountID);
};

export function SSEPush(data, targetID) {
    const payload = {
        targetID,
        data
    }

    console.log("ClientCount: ", sseClients.length)
    console.log("Payload: ", payload)
    
    const client = sseClients.find((client) => client.accountID === targetID)
    if (client) client.sse.write(JSON.stringify(payload))
}