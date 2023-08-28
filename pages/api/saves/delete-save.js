import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteSave(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function DeleteSave(params) {
    params = parseParams([
        "accountID",
        "communityID"
    ], params);

    try {
        ValidateDeleteSave(params)

        const checkSave = await db.collection("saves").findOne({ accountID: params.accountID, echoID: params.echoID })
        if (!checkSave) throw new Error("This echo isn't saved.")

        const deleteSaveResponse = await db.collection("saves").deleteOne({ accountID: params.accountID, echoID: params.echoID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteSaveResponse,
            message: "Save deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}