import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateSettings(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.language && data.language.length < 1) throw new Error("Invalid language")
    if (data.activeStatus && !ParamValidator.isValidActiveStatus(data.activeStatus)) throw new Error("Invalid activeStatus")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function UpdateSettings(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID", 
        "language", 
        "blocked", 
        "showInSearch", 
        "seeEchoRecs", 
        "safeSearch", 
        "dmNotification", 
        "followNotification", 
        "mentionNotification",
        "commentNotification",
        "echoHeartNotification",
        "commentHeartNotification",
        "commentReplyNotification",
        "showProfile",
        "activeStatus",
        "followable",
        "dark"
    ], params);

    try {
        ValidateUpdateSettings(params);

        const userSettings = await db.collection("settings").findOneAndUpdate({ accountID: params.accountID }, {$set: params})
        if (!userSettings) throw new Error("Settings does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: userSettings,
            message: "Settings updated successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}