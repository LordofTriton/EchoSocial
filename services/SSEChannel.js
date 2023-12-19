import { createChannel } from "better-sse";

const SSESessions = [];

export function SSERegister(accountID, session) {
    const sse = SSESessions.find((session) => session.targetID === accountID)
    if (!sse) SSESessions.push({targetID: accountID, sse: session})
    
    session.push()
}

export function SSEPush(data, targetID) {
    const payload = {
        targetID,
        data
    }

    console.log("SessionCount: ", SSESessions.length)
    console.log("Payload: ", payload)
    
    const session = SSESessions.find((session) => session.targetID === targetID)
    if (session) session.sse.push(payload)
}

export function SSEBroadcast(data) {
    console.log("SessionCount: ", SSESessions.length)
    console.log("Data: ", data)
    
    for (let session of SSESessions) {
        session.sse.push(data)
    }
}