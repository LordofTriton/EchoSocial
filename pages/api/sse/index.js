import { SSEAddClient } from "./SSEClient";

let clients = []

export default (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const clientData = { accountID: req.query.accountID, sse: res }

    clients.push(clientData);

    res.on('close', () => {
        clients = clients.filter((obj) => obj.accountID !== req.query.accountID);
        console.log(`SSE: Client ${req.query.accountID} disconnected.`);
    });

    res.write("SSE Connected.");
};

export function SSEBroadcast(header, data) {
    const message = {
        type: "broadcast",
        header,
        to: null,
        data
    }

    clients.forEach((client) => {
        client.sse.write(JSON.stringify(message));
    });
};

export function SSEPush(accountID, header, data) {
    console.log(clients)
    const message = {
        type: "push",
        header,
        to: accountID,
        data 
    }

    const client = clients.find((client) => client.accountID === accountID)
    if (client) client.sse.write(JSON.stringify(message))
}