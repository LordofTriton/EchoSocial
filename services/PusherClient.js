import pusherJs from "pusher-js";

const PusherClient = new pusherJs("50f5658f71430c02353d", {
    cluster: "eu"
});

export default PusherClient;