import Pusher from "pusher-js"

const PusherClient = new Pusher(process.env.PUSHER_KEY, {
    cluster: process.env.PUSHER_CLUSTER,
    forceTLS: true
});

export default PusherClient;