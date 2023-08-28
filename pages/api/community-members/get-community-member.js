import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetMember(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.communityID && !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Invalid: communityID.")
    if (data.userID && !ParamValidator.isValidObjectID(data.userID)) throw new Error("Invalid: userID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function GetMember(params, io) {
    params = parseParams([
        "accountID",
        "communityID",
        "userID"
    ], params);

    try {
        ValidateGetMember(params);

        let fetchMemberResponse = await db.collection("members").findOne({ accountID: params.userID, communityID: params.communityID }).toArray();

        const responseData = ResponseClient.DBModifySuccess({
            data: fetchMemberResponse,
            message: "Member fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}