import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function DeleteComment(params, io) {
    params = parseParams([
        "accountID",
        "commentID"
    ], params);

    try {
        ValidateDeleteComment(params)

        const deleteCommentResponse = await db.collection("comments").deleteOne({ commentID: params.commentID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteCommentResponse,
            message: "Comment deleted successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}