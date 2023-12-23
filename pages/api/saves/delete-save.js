import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteSave(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID")
}

export default async function DeleteSave(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "echoID"
    ], request.query);

    try {
        ValidateDeleteSave(params)

        const checkSave = await db.collection("saves").findOne({ accountID: params.accountID, echoID: params.echoID })
        if (!checkSave) throw new Error("This echo isn't saved.")

        const deleteSaveResponse = await db.collection("saves").deleteOne({ accountID: params.accountID, echoID: params.echoID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteSaveResponse,
            message: "Save deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}