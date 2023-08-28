import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteNode(data) {
    if (!data.nodeID || !ParamValidator.isValidObjectID(data.nodeID)) throw new Error("Missing or Invalid: nodeID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function DeleteNode(params) {
    params = parseParams([
        "accountID",
        "nodeID"
    ], params);

    try {
        ValidateDeleteNode(params)

        const deleteNodeResponse = await db.collection("nodes").deleteOne({ nodeID: params.nodeID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteNodeResponse,
            message: "Node deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}