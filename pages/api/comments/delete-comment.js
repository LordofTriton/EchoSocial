import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function DeleteComment (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "commentID"
    ], request.query);

    try {
        ValidateDeleteComment(params)

        const deleteCommentResponse = await db.collection("comments").deleteOne({ commentID: params.commentID })

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteCommentResponse,
            message: "Comment deleted successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}