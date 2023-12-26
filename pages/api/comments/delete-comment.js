import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateDeleteComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
}

async function DeleteComment (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
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

export default authenticate(DeleteComment);