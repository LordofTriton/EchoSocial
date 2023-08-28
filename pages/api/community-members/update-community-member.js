
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
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function UpdateMember(params, io) {
    params = parseParams([
        "accountID",
        "userID",
        "muted",
        "status",
        "role"
    ], params);

    try {
        ValidateUpdateMember(params);

        const member = await db.collection("members").findOneAndUpdate({ accountID: params.userID }, {$set: params})
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