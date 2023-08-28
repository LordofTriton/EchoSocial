import { getDB } from "../../../util/db/mongodb";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import TokenGenerator from "../../../services/generators/TokenGenerator";

import NickGenerator from "../../../services/generators/NIckGenerator";

function ValidateCreateChat(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.targetID || !ParamValidator.isValidAccountID(data.targetID)) throw new Error("Missing or Invalid: targetID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async (request, response) => {
    let params = parseParams([
        "accountID",
        "targetID"
    ], request.body);

    try {
        ValidateCreateChat(params)

        let userChat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: params.targetID })
        if (userChat) throw new Error("This chat already exists.")

        const chatData = {
            chatID: IDGenerator.GenerateChatID(),
            participants: [
                { accountID: params.accountID, muted: false, archived: false },
                { accountID: params.targetID, muted: false, archived: false }
            ],
            lastUpdated: Date.now()
        }

        const createChatResponse = await db.collection("chats").insertOne(chatData)
        if (createChatResponse.errors) throw new Error("An error occured when creating chat.");

        const responseData = ResponseClient.DBModifySuccess({
            data: chatData,
            message: "Chat created successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}