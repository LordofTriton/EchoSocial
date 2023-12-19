import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import DeleteNode from "../nodes/delete-node";

function ValidateDeleteCommunity(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteCommunity (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "communityID"
    ], request.query);

    try {
        ValidateDeleteCommunity(params)

        const community = (await db.collection("communities").findOne({ communityID: params.communityID }))
        const authUserMember = await db.collection("members").findOne({ communityID: params.communityID, accountID: params.accountID })
        if (authUserMember.role !== "admin") throw new Error("You are unauthorised to delete this community.")

        const deleteCommunityResponse = await db.collection("communities").deleteOne({ communityID: params.communityID })

        await axios.post(request.headers.origin + "/api/nodes/delete-node", {
            accountID: params.accountID,
            nodeID: community.node.nodeID
        })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteCommunityResponse,
            message: "Community deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}