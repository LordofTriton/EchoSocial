import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteSettings(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
}

async function DeleteSettings(request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
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

export default authenticate(DeleteSettings);