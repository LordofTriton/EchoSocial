import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteSettings(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteSettings(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID"
    ], params);

    try {
        ValidateDeleteSettings(params)

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;

        const deleteSettingsResponse = await db.collection("settings").deleteOne(filters)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteSettingsResponse,
            message: "Settings deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}