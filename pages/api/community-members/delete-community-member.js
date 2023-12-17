import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteMember(data) {
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteCommunityMember (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "communityID",
        "userID"
    ], request.query);

    try {
        ValidateDeleteMember(params)

        const deleteMemberResponse = await db.collection("members").deleteOne({ accountID: params.userID, communityID: params.communityID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteMemberResponse,
            message: "Member deleted successfully."
        })

        response.json(responseData);
        
        response.once("finish", async () => {
            await DeleteMemberCallback(params, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function DeleteMemberCallback(params, request) {
    const community = await db.collection("communities").findOne({ communityID: params.communityID })
    await db.collection("nodes").findOneAndUpdate({ nodeID: community.node.nodeID }, { $inc: { pings: 1 }})
}