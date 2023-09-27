import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteAccount(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.password || data.password.length < 6) throw new Error("Missing or Invalid: password.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteAccount(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "password"
    ], params);

    try {
        ValidateDeleteAccount(params)

        const deleteAccountResponse = await db.collection("accounts").deleteOne(params)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteAccountResponse,
            message: "Account deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}