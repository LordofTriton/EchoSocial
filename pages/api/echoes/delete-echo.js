import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteEcho(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "echoID"
    ], request.query);

    try {
        ValidateDeleteEcho(params)

        const deleteEchoResponse = await db.collection("echoes").deleteOne({ echoID: params.echoID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteEchoResponse,
            message: "Echo deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}