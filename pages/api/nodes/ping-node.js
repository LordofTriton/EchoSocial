import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateCreateNode(data) {
    if (!data || data.name.length < 2) throw new Error("Missing or Invalid: name")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateNode(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "name",
        "emoji"
    ], params);

    try {
        ValidateCreateNode(params)

        let userNode = await db.collection("nodes").findOne({ name: String(params.name).toLowerCase().replace(/\s/g, "").trim() })
        if (userNode) throw new Error("Node with this email already exists.")

        const nodeData = {
            nodeID: IDGenerator.GenerateNodeID(),
            emoji: params.emoji,
            name: String(params.name).toLowerCase().replace(/\s/g, "").trim(),
            displayName: params.name,
            pings: 0
        }

        const createNodeResponse = await db.collection("nodes").insertOne(nodeData)
        if (createNodeResponse.errors) throw new Error("An error occured when creating node.");

        const responseData = ResponseClient.DBModifySuccess({
            data: createNodeResponse,
            message: "Node created successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}