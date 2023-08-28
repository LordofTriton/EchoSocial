const clientMap = new Map();

function addClient(accountID, socket) {
    clientMap.set(accountID, socket);
}

function removeClient(accountID) {
    clientMap.delete(accountID);
}

function getClientSocket(accountID) {
    return clientMap.get(accountID);
}

export default {
    addClient,
    removeClient,
    getClientSocket,
    clientMap
};