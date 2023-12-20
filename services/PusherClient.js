import Pusher from "pusher-js"

const PusherClient = new Pusher("50f5658f71430c02353d", {
    cluster: "eu",
    forceTLS: true
});

export default PusherClient;