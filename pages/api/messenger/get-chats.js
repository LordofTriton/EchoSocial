import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetChats(data) {
    if (!data.accountID || !ParamValidator.isValidObjectID(data.accountID)) throw new Error("Invalid: accountID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async (request, response) => {
    let params = parseParams([
        "accountID",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetChats(params);

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        const chats = await db.collection("chats").find({ participants: { $elemMatch: { accountID: params.accountID } } }).sort({ lastUpdated: -1 }).skip(skip).limit(pagination.pageSize).toArray()
        if (!chats || chats.length < 1) throw new Error("You have no chats open!")

        const chatsData = chats.map(async (chat) => {
            let messages = await db.collection("messages").find({ chatID: chat.chatID }).sort({ datetime: -1 }).skip(0).limit(11).toArray()
            let participants = await chat.participants.map(async (participant) => {
                const user = await db.collection("accounts").findOne({ accountID: participant.accountID })
                return {
                    ...participant,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImage: user.profileImage
                }
            })
            return {
                ...chat,
                participants,
                lastest: messages
            }
        })
        
        const responseData = ResponseClient.DBModifySuccess({
            data: chatsData,
            message: "Chats fetched successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}