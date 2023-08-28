import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
    if (data.audience && !ParamValidator.isValidAudience(data.audience)) throw new Error("Invalid: audience")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes")
    if (data.content) {
        if (data.content.text && data.content.text.length < 5) throw new Error("Missing or Invalid: content text.")
    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function UpdateEcho(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "audience",
        "nodes",
        "content"
    ], params);

    try {
        ValidateUpdateEcho(params);

        const echo = await db.collection("echoes").findOneAndUpdate({ echoID: params.echoID }, {$set: params})
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