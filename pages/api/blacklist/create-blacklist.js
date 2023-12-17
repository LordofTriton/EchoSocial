import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";
import DeleteHeart from "../hearts/delete-heart";

function ValidateCreateBlacklist(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.blocker && !ParamValidator.isValidObjectID(data.blocker)) throw new Error("Invalid: blocker.")
    if (data.blockee && !ParamValidator.isValidObjectID(data.blockee)) throw new Error("Invalid: blockee.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateBlacklist (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "blocker",
        "blockee",
        "blockeeType"
    ], request.body);

    try {
        ValidateCreateBlacklist(params)
        if (params.blocker === params.blockee) throw new Error("You cannot block yourself!")

        let blocked = await db.collection("blacklists").findOne({ blocker: params.blocker, blockee: params.blockee })
        if (blocked) throw new Error("Already blocked :)")

        const blacklistData = {
            blacklistID: IDGenerator.GenerateBlacklistID(),
            accountID: params.accountID,
            blocker: params.blocker,
            blockee: params.blockee,
            blockeeType: params.blockeeType,
            datetime: Date.now()
        }

        const createBlacklistResponse = await db.collection("blacklists").insertOne(blacklistData)
        if (createBlacklistResponse.errors) throw new Error("An error occured when creating blacklist.");

        const createdBlacklist = await db.collection("blacklists").findOne({ blacklistID: blacklistData.blacklistID })
        const responseData = ResponseClient.DBModifySuccess({
            data: createdBlacklist,
            message: "Blacklist created successfully."
        })
        
        response.json(responseData);

        response.once("finish", async () => {
            await axios.post(request.headers.origin + "/api/hearts/delete-heart", { accountID: params.blocker, userID: params.blockee })
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}