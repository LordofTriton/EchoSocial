import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";

function ValidateCreateComment(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.echoID || !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Missing or Invalid: echoID.")
    if (!data.content) throw new Error("Missing or Invalid: content.")
    if (data.content) {
        if (data.content.text && data.content.text.length < 1) throw new Error("Missing or Invalid: content text.")
    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function CreateComment(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "content",
        "repliedTo"
    ], params);

    try {
        ValidateCreateComment(params)

        const commentData = {
            commentID: IDGenerator.GenerateCommentID(),
            echoID: params.echoID,
            accountID: params.accountID,
            content: {
                text: params.content.text,
                media: params.content.media,
                link: params.content.link
            },
            datetime: Date.now(),
            repliedTo: params.repliedTo
        }

        const createCommentResponse = await db.collection("comments").insertOne(commentData)
        if (createCommentResponse.errors) throw new Error("An error occured when creating comment.");

        const echo = (await db.collection("echoes").findOne({ echoID: params.echoID }))
        const commentUser = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const result = {
            ...commentData,
            firstName: commentUser.firstName,
            lastName: commentUser.lastName,
            profileImage: commentUser.profileImage
        }

        io.emit(`NEW_COMMENT_${params.echoID}`, JSON.stringify(result))

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Comment created successfully."
        })

        await CreateHeart({
            accountID: params.accountID,
            commentID: commentData.commentID
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateCommentCallback(params, io) {
    const { db } = await getDB();
    const echo = (await db.collection("echoes").findOne({ echoID: params.echoID }))
    const commentUser = (await db.collection("accounts").findOne({ accountID: params.accountID }))

    if (params.accountID !== echo.accountID) {
        const echoUserSettings = await db.collection("settings").findOne({ accountID: echo.accountID })
        if (echoUserSettings.commentNotification) {
            await CreateNotification({
                accountID: echo.accountID,
                content: `${commentUser.firstName} ${commentUser.lastName} commented on your echo.`,
                image: commentUser.profileImage.url,
                clickable: true,
                redirect: echo.url
            }, io)
        }
    }

    if (params.repliedTo && params.accountID !== params.repliedTo.accountID) {
        const replyUserSettings = await db.collection("settings").findOne({ accountID: params.repliedTo.accountID })
        if (replyUserSettings.commentReplyNotification) {
            await CreateNotification({
                accountID: params.repliedTo.accountID,
                content: `${commentUser.firstName} ${commentUser.lastName} replied to your comment on an echo.`,
                image: commentUser.profileImage.url,
                clickable: true,
                redirect: echo.url
            }, io)
        }
    }
}