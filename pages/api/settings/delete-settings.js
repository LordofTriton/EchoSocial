import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
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

export default async function DeleteSettings(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID"
    ], request.query);

    try {
        ValidateDeleteSettings(params)

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;

        const deleteSettingsResponse = await db.collection("settings").deleteOne(filters)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteSettingsResponse,
            message: "Settings deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}