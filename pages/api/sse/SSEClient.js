let clients = [];

export const SSEAddClient = (data, client) => {
    const clientData = { accountID: data.accountID, sse: client }

    clients.push(clientData);

    client.on('close', () => {
        clients = clients.filter((obj) => obj.accountID !== data.accountID);

        console.log(`SSE: Client ${data.accountID} disconnected.`);
    });

    console.log(`SSE: Client ${data.accountID} connected.`);
};

export const SSEBroadcast = (header, data) => {
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

export const SSEPush = (accountID, header, data) => {
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