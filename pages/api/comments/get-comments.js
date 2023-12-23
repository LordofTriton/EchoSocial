import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetComments(data) {
    if (!data.echoID || !ParamValidator.isValidAccountID(data.echoID)) throw new Error("Missing or Invalid: echoID.")
    if (data.commentID && !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Invalid: commentID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

export default async function GetComments (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "commentID",
        "echoID",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetComments(params);
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID}] }).toArray()

        const filters = {
            $and: [
                { accountID: { $nin: blacklist.filter((blck) => blck.blocker === params.accountID).map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.filter((blck) => blck.blockee === params.accountID).map((obj) => obj.blocker) } } 
            ]
        }
        if (params.commentID) filters.commentID = params.commentID;
        if (params.echoID) filters.echoID = params.echoID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchCommentsResponse = await db.collection("comments").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const commentCount = await db.collection("comments").countDocuments(filters);
        if (fetchCommentsResponse.length < 1) fetchCommentsResponse = [];

        let commentData = []
        for (let comment of fetchCommentsResponse) {
            const user = (await db.collection("accounts").findOne({ accountID: comment.accountID }))
            let heartCount = await db.collection("hearts").countDocuments({ commentID: comment.commentID });
            let userHearted = await db.collection("hearts").findOne({ accountID: params.accountID, commentID: params.commentID });

            const finalCommentData = {
                ...comment,
                hearts: heartCount,
                userHearted: userHearted ? true : false,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            commentData.push(finalCommentData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: commentData.reverse(),
            message: "Comments fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: commentCount,
            pagination: true
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}