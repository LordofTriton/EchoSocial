import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteApplication(data) {
    if (!data.applicationID || !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Missing or Invalid: applicationID")
}

async function DeleteCommunityApplication (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
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

export default authenticate(DeleteCommunityApplication);