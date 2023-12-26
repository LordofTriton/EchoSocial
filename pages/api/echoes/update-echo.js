import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateEcho(data) {
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes")
    if (data.content) {
        if (data.content.text && data.content.text.length < 5) throw new Error("Missing or Invalid: content text.")
    }
}

async function UpdateEcho(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "echoID",
        "audience",
        "nodes",
        "content"
    ], request.body);

    try {
        ValidateUpdateEcho(params);

        const echo = await db.collection("echoes").findOneAndUpdate({ echoID: params.echoID }, {$set: params})
        if (!echo) throw new Error("Echo does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: echo,
            message: "Echo updated successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(UpdateEcho);