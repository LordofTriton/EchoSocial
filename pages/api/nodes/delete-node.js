import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteNode(data) {
    if (!data.nodeID || !ParamValidator.isValidObjectID(data.nodeID)) throw new Error("Missing or Invalid: nodeID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteNode(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "nodeID"
    ], request.query);

    try {
        ValidateDeleteNode(params)

        const deleteNodeResponse = await db.collection("nodes").deleteOne({ nodeID: params.nodeID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteNodeResponse,
            message: "Node deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}