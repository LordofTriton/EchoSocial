import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteBlacklist(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.blocker && !ParamValidator.isValidObjectID(data.blocker)) throw new Error("Invalid: blocker.")
    if (data.blockee && !ParamValidator.isValidObjectID(data.blockee)) throw new Error("Invalid: blockee.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteBlacklist (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "blocker",
        "blockee"
    ], request.query);

    try {
        ValidateDeleteBlacklist(params)

        const deleteBlacklistResponse = await db.collection("blacklists").deleteOne({
            blocker: params.blocker,
            blockee: params.blockee
        })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteBlacklistResponse,
            message: "Blacklist deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}