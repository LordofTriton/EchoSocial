const Pusher = require("pusher");

const appId = "1727471";
const key = "50f5658f71430c02353d";
const secret = "7b8da5c92f2012db801a";
const cluster = "eu";

const PusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true
});

export default PusherServer;