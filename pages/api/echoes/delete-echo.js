import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function DeleteEcho(params) {
    params = parseParams([
        "accountID",
        "echoID"
    ], params);

    try {
        ValidateDeleteEcho(params)

        const deleteEchoResponse = await db.collection("echoes").deleteOne({ echoID: params.echoID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteEchoResponse,
            message: "Echo deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}