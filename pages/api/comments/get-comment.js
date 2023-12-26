import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetComment(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.commentID && !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Invalid: commentID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

async function GetComment (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "commentID"
    ], request.query);

    try {
        ValidateGetComment(params);

        let fetchCommentResponse = await db.collection("comments").findOne({ commentID: params.commentID }).toArray();

        const responseData = ResponseClient.DBModifySuccess({
            data: fetchCommentResponse,
            message: "Comment fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetComment);