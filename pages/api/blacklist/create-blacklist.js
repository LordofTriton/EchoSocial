import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidateCreateBlacklist(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.blocker && !ParamValidator.isValidObjectID(data.blocker)) throw new Error("Invalid: blocker.")
    if (data.blockee && !ParamValidator.isValidObjectID(data.blockee)) throw new Error("Invalid: blockee.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function CreateBlacklist(params, io) {
    params = parseParams([
        "accountID",
        "blocker",
        "blockee"
    ], params);

    try {
        ValidateCreateBlacklist(params)
        if (params.blocker === params.blockee) throw new Error("You cannot block yourself!")

        let blocked = await db.collection("blacklists").findOne({ blocker: params.blocker, blockee: params.blockee })
        if (blocked) throw new Error("Already blocked :)")

        const blacklistData = {
            blacklistID: IDGenerator.GenerateBlacklistID(),
            accountID: params.accountID,
            datetime: Date.now()
        }
        if (params.blocker) blacklistData.blocker = params.blocker;
        if (params.blockee) blacklistData.blockee = params.blockee;
        blacklistData.datetime = Date.now()

        const createBlacklistResponse = await db.collection("blacklists").insertOne(blacklistData)
        if (createBlacklistResponse.errors) throw new Error("An error occured when creating blacklist.");

        const responseData = ResponseClient.DBModifySuccess({
            data: createBlacklistResponse,
            message: "Blacklist created successfully."
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}