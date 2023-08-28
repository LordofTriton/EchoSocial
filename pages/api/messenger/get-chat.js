import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetChat(data) {
    if (!data.chatID || !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Invalid: chatID.")
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
        "chatID"
    ], request.query);

    try {
        ValidateGetChat(params);

        const filters = {}
        if (params.chatID) filters.chatID = params.chatID;

        let fetchChatResponse = await db.collection("chats").findOne(filters);
        let fetchMessages = await db.collection("messages").find({ chatID: params.chatID }).sort({ datetime: -1 }).skip(0).limit(11).toArray()

        const responseData = ResponseClient.DBModifySuccess({
            data: {
                ...fetchChatResponse,
                latest: fetchMessages
            },
            message: "Chat fetched successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}