import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteApplication(data) {
    if (!data.applicationID || !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Missing or Invalid: applicationID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function DeleteApplication(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "applicationID"
    ], params);

    try {
        ValidateDeleteApplication(params)

        const deleteApplicationResponse = await db.collection("applications").deleteOne({ applicationID: params.applicationID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteApplicationResponse,
            message: "Application deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}