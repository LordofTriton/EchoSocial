import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
    if (data.audience && !ParamValidator.isValidAudience(data.audience)) throw new Error("Invalid: audience")
    if (data.audience && !ParamValidator.isValidAudience(data.audience)) throw new Error("Invalid: audience")
    if (data.content) {

    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function UpdateComment(params, io) {
    params = parseParams([
        "accountID",
        "commentID",
        "content"
    ], params);

    try {
        ValidateUpdateComment(params);

        const comment = await db.collection("comments").findOneAndUpdate({ commentID: params.commentID }, {$set: params})
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