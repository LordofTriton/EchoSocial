
import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateMember(data) {
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID")
    if (data.status && !ParamValidator.isValidMemberStatus(data.status)) throw new Error("Invalid: status")
    if (data.role && !ParamValidator.isValidMemberRole(data.role)) throw new Error("Invalid: role")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function UpdateMember(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID",
        "userID",
        "muted",
        "status",
        "role"
    ], params);

    try {
        ValidateUpdateMember(params);

        const filter = {
            accountID: params.userID,
            communityID: params.communityID
        }
        const update = {}
        if (params.muted) update.muted = params.muted;
        if (params.status) update.status = params.status;
        if (params.role) update.role = params.role;

        const member = await db.collection("members").findOneAndUpdate(filter, {$set: update})
        if (!member) throw new Error("Member does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: member,
            message: "Member updated successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}