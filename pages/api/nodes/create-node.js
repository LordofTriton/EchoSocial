import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";

function ValidateCreateNode(data) {
    if (!data || data.name.length < 2) throw new Error("Missing or Invalid: name")
}

async function CreateNode(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "name",
        "emoji"
    ], request.body);

    try {
        ValidateCreateNode(params)

        let userNode = await db.collection("nodes").findOne({ name: String(params.name).toLowerCase().replace(/\s/g, "").trim() })
        if (userNode) {
            const responseData = ResponseClient.DBModifySuccess({
                data: userNode,
                message: "Node fetched successfully."
            })
            response.json(responseData);
        }

        const nodeData = {
            nodeID: IDGenerator.GenerateNodeID(),
            emoji: params.emoji,
            name: String(params.name).toLowerCase().replace(/\s/g, "").trim(),
            displayName: params.name,
            pings: 0
        }

        const createNodeResponse = await db.collection("nodes").insertOne(nodeData)
        if (createNodeResponse.errors) throw new Error("An error occured when creating node.");

        const node = await db.collection("nodes").findOne({ nodeID: nodeData.nodeID })
        const responseData = ResponseClient.DBModifySuccess({
            data: node,
            message: "Node created successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(CreateNode);