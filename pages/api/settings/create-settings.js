import { getDB } from "../../../util/db/mongodb";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import TokenGenerator from "../../../services/generators/TokenGenerator";

import NickGenerator from "../../../services/generators/NIckGenerator";

function ValidateCreateSettings(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function CreateSettings(params) {
    params = parseParams([
        "accountID"
    ], params);

    try {
        ValidateCreateSettings(params)

        let userSettings = await db.collection("settings").findOne({ accountID: params.accountID })
        if (userSettings) throw new Error("Settings for this user already exists.")

        const settingsData = {
            accountID: params.accountID,
            language: "English",
            blocked: [],
            showInSearch: true,
            seeEchoRecs: false,
            safeSearch: true,
            dmNotification: true,
            followNotification: true,
            mentionNotification: true,
            commentNotification: true,
            echoHeartNotification: true,
            commentHeartNotification: false,
            commentReplyNotification: true,
            showProfile: true,
            activeStatus: "online",
            followable: true,
            dark: false
        }

        const createSettingsResponse = await db.collection("settings").insertOne(settingsData)
        if (createSettingsResponse.errors) throw new Error("An error occured when creating settings.");

        userSettings = await db.collection("settings").findOne({ accountID: params.accountID })
        const responseData = ResponseClient.DBModifySuccess({
            data: settingsData,
            message: "Settings created successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}