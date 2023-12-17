import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import CreateNotification from "../notifications/create-notification";

function ValidateCreateSave(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.echoID || !ParamValidator.isValidAccountID(data.echoID)) throw new Error("Missing or Invalid: echoID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateSave(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "echoID"
    ], request.body);

    try {
        ValidateCreateSave(params)

        let newSave = await db.collection("saves").findOne({ echoID: params.echoID })
        if (newSave) throw new Error("This echo is already saved.")

        const savedData = {
            saveID: IDGenerator.GenerateSaveID(),
            accountID: params.accountID,
            echoID: params.echoID,
            datetime: Date.now()
        }

        const createSaveResponse = await db.collection("saves").insertOne(savedData)
        if (createSaveResponse.errors) throw new Error("An error occured when creating save.");

        const responseData = ResponseClient.DBModifySuccess({
            data: savedData,
            message: "Save created successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}