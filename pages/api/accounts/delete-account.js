import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteAccount(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.email && !ParamValidator.isValidEmail(data.email)) throw new Error("Invalid: email.")
    if (!data.email && !data.accountID) throw new Error("Requires email or accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function DeleteAccount(params) {
    params = parseParams([
        "accountID",
        "email"
    ], params);

    try {
        ValidateDeleteAccount(params)

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;
        if (params.email) filters.email = params.email;

        const deleteAccountResponse = await db.collection("accounts").deleteOne(filters)

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