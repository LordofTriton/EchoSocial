import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetSettings(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetSettings(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID"
    ], request.query);

    try {
        ValidateGetSettings(params);

        const filters = {}
        if (params.accountID) filters.accountID = params.accountID;

        let fetchSettingsResponse = await db.collection("settings").findOne(filters);
        
        const userSettings = {
            accountID: fetchSettingsResponse.accountID,
            language: fetchSettingsResponse.language,
            blocked: fetchSettingsResponse.blocked,
            showInSearch: fetchSettingsResponse.showInSearch,
            seeEchoRecs: fetchSettingsResponse.seeEchoRecs,
            safeSearch: fetchSettingsResponse.safeSearch,
            dmNotification: fetchSettingsResponse.dmNotification,
            followNotification: fetchSettingsResponse.followNotification,
            mentionNotification: fetchSettingsResponse.mentionNotification,
            commentNotification: fetchSettingsResponse.commentNotification,
            echoHeartNotification: fetchSettingsResponse.echoHeartNotification,
            commentHeartNotification: fetchSettingsResponse.commentHeartNotification,
            commentReplyNotification: fetchSettingsResponse.commentReplyNotification,
            showProfile: fetchSettingsResponse.showProfile,
            activeStatus: fetchSettingsResponse.activeStatus,
            followable: fetchSettingsResponse.followable,
            dark: fetchSettingsResponse.dark
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: userSettings,
            message: "Settings fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}