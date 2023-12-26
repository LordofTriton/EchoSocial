import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidatePingEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
    if (data.addHeart && !ParamValidator.isValidAccountID(data.addHeart)) throw new Error("Missing or Invalid: addHeart")
    if (data.removeHeart && !ParamValidator.isValidAccountID(data.removeHeart)) throw new Error("Missing or Invalid: removeHeart")
    if (Object.keys(data).length > 2) throw new Error("Invalid number of operations.")
}

async function PingEcho(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "echoID",
        "addHeart",
        "removeHeart"
    ], request.body);

    try {
        ValidatePingEcho(params);

        let operation;
        if (params.addHeart) operation = { $push: { hearts: params.addHeart } }
        else if (params.removeHeart) operation = { $pull: { hearts: params.removeHeart } }

        const echo = await db.collection("echoes").findOneAndUpdate({ echoID: params.echoID }, operation)
        if (!echo) throw new Error("Echo does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: echo,
            message: "Echo updated successfully."
        })
        response.json(responseData);
        
        response.once("finish", async () => {
            await PingEchoCallback(params, AppConfig.HOST, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function PingEchoCallback(params, reqOrigin, request) {
    const { db } = await getDB();
    const echo = await db.collection("echoes").findOne({ echoID: params.echoID })
    if (params.addHeart) await db.collection("accounts").updateOne({ accountID: echo.accountID }, { $inc: { hearts: 1 } })
    if (params.removeHeart) await db.collection("accounts").updateOne({ accountID: echo.accountID }, { $inc: { hearts: -1 } })
}

export default authenticate(PingEcho);