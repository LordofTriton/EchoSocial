import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteApplication(data) {
    if (!data.applicationID || !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Missing or Invalid: applicationID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteCommunityApplication (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "applicationID"
    ], request.query);

    try {
        ValidateDeleteApplication(params)

        const deleteApplicationResponse = await db.collection("applications").deleteOne({ applicationID: params.applicationID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteApplicationResponse,
            message: "Application deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}