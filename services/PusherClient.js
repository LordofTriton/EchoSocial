import pusherJs from "pusher-js";

const PusherClient = new pusherJs(process.env.PUSHER_KEY, {
    cluster: process.env.PUSHER_CLUSTER
});

export default PusherClient;