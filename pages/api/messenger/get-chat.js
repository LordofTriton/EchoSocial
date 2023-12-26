import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetChat(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.chatID && !ParamValidator.isValidObjectID(data.chatID)) throw new Error("Invalid: chatID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

async function GetChat(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "chatID",
        "targetID"
    ], request.query);

    try {
        ValidateGetChat(params);

        let chat = await db.collection("chats").findOne(params);
        const origin = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const target = (await db.collection("accounts").findOne({ accountID: chat.targetID }))
        let userFriend = (await db.collection("friends").findOne({ accountID: params.accountID, friendID: target.accountID }))
        const now = Date.now()

        const finalChatData = {
            ...chat,
            origin: {
                accountID: origin.accountID,
                firstName: origin.firstName,
                lastName: origin.lastName,
                profileImage: origin.profileImage,
                lastActive: origin.lastActive,
                active: now - origin.lastActive < 300000 ? true : false
            },
            target: {
                accountID: target.accountID,
                firstName: target.firstName,
                lastName: target.lastName,
                profileImage: target.profileImage,
                lastActive: target.lastActive,
                active: now - target.lastActive < 300000 ? true : false
            },
            userFriend: userFriend ? true : false
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: finalChatData,
            message: "Chat fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetChat);