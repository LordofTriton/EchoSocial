import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidatePingEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
    if (data.addHeart && !ParamValidator.isValidAccountID(data.addHeart)) throw new Error("Missing or Invalid: addHeart")
    if (data.removeHeart && !ParamValidator.isValidAccountID(data.removeHeart)) throw new Error("Missing or Invalid: removeHeart")
    if (Object.keys(data).length > 2) throw new Error("Invalid number of operations.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function PingEcho(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "addHeart",
        "removeHeart"
    ], params);

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
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function PingEchoCallback(params, io) {
    const { db } = await getDB();
    const echo = await db.collection("echoes").findOne({ echoID: params.echoID })
    if (params.addHeart) await db.collection("accounts").updateOne({ accountID: echo.accountID }, { $inc: { hearts: 1 } })
    if (params.removeHeart) await db.collection("accounts").updateOne({ accountID: echo.accountID }, { $inc: { hearts: -1 } })
}