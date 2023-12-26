import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteAccount(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.password || data.password.length < 6) throw new Error("Missing or Invalid: password.")
}

async function DeleteAccount (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "password"
    ], request.query);

    try {
        ValidateDeleteAccount(params)

        const deleteAccountResponse = await db.collection("accounts").deleteOne(params)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteAccountResponse,
            message: "Account deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(DeleteAccount);