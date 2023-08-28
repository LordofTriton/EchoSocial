import { getDB } from "../../../util/db/mongodb";
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
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function PingComment(params, io) {
    params = parseParams([
        "accountID",
        "commentID",
        "addHeart",
        "removeHeart"
    ], params);

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
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function PingCommentCallback(params, io) {
    if (params.addHeart) await db.collection("accounts").updateOne({ accountID: comment.value.accountID }, { $inc: { hearts: 1 } })
    if (params.removeHeart) await db.collection("accounts").updateOne({ accountID: comment.value.accountID }, { $inc: { hearts: -1 } })
}