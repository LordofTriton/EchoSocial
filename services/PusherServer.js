const Pusher = require("pusher");

require('dotenv').config()

const PusherServer = new Pusher({
    appId: "1727471",
    key: "50f5658f71430c02353d",
    secret: "7b8da5c92f2012db801a",
    cluster: "eu",
    useTLS: true
});

export default PusherServer;