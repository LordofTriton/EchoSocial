import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteMember(data) {
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function DeleteMember(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID",
        "userID"
    ], params);

    try {
        ValidateDeleteMember(params)

        const deleteMemberResponse = await db.collection("members").deleteOne({ accountID: params.userID, communityID: params.communityID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteMemberResponse,
            message: "Member deleted successfully."
        })

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function DeleteMemberCallback(params, io) {
    const community = await db.collection("communities").findOne({ communityID: params.communityID })
    await db.collection("nodes").findOneAndUpdate({ nodeID: community.node.nodeID }, { $inc: { pings: 1 }})
}