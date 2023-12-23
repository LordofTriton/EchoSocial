
import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateMember(data) {
    if (!data.userID || !ParamValidator.isValidObjectID(data.userID)) throw new Error("Missing or Invalid: userID")
    if (data.status && !ParamValidator.isValidMemberStatus(data.status)) throw new Error("Invalid: status")
    if (data.role && !ParamValidator.isValidMemberRole(data.role)) throw new Error("Invalid: role")
}

export default async function UpdateMember(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID",
        "userID",
        "muted",
        "status",
        "role"
    ], request.body);

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
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}