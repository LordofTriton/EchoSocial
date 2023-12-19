import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidatePingComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
    if (data.addHeart && !ParamValidator.isValidAccountID(data.addHeart)) throw new Error("Missing or Invalid: addHeart")
    if (data.removeHeart && !ParamValidator.isValidAccountID(data.removeHeart)) throw new Error("Missing or Invalid: removeHeart")
    if (Object.keys(data).length > 2) throw new Error("Invalid number of operations.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function PingComment (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "commentID",
        "addHeart",
        "removeHeart"
    ], request.body);

    try {
        ValidatePingComment(params);

        let operation;
        if (params.addHeart) operation = { $push: { hearts: params.addHeart } }
        else if (params.removeHeart) operation = { $pull: { hearts: params.removeHeart } }

        const comment = await db.collection("comments").findOneAndUpdate({ commentID: params.commentID }, operation)
        if (!comment) throw new Error("Comment does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: comment,
            message: "Comment updated successfully."
        })
        response.json(responseData);
        
        response.once("finish", async () => {
            await PingCommentCallback(params, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function PingCommentCallback(params, request) {
    const { db } = await getDB();
    if (params.addHeart) await db.collection("accounts").updateOne({ accountID: comment.value.accountID }, { $inc: { hearts: 1 } })
    if (params.removeHeart) await db.collection("accounts").updateOne({ accountID: comment.value.accountID }, { $inc: { hearts: -1 } })
}