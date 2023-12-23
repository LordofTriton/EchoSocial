import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
}

export default async function DeleteEcho(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
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