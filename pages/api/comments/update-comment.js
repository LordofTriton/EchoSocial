import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateComment(data) {
    if (!data.commentID || !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Missing or Invalid: commentID")
    if (data.audience && !ParamValidator.isValidAudience(data.audience)) throw new Error("Invalid: audience")
    if (data.audience && !ParamValidator.isValidAudience(data.audience)) throw new Error("Invalid: audience")
    if (data.content) {

    }
}

async function UpdateComment (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "commentID",
        "content"
    ], request.body);

    try {
        ValidateUpdateComment(params);

        const comment = await db.collection("comments").findOneAndUpdate({ commentID: params.commentID }, {$set: params})
        if (!comment) throw new Error("Comment does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: comment,
            message: "Comment updated successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(UpdateComment);