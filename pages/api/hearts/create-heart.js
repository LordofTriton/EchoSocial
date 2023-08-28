import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import AppConfig from "../../../util/config";

function ValidateCreateHeart(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.userID && !ParamValidator.isValidAccountID(data.userID)) throw new Error("Invalid: userID.")
    if (data.echoID && !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Invalid: echoID.")
    if (data.commentID && !ParamValidator.isValidObjectID(data.commentID)) throw new Error("Invalid: commentID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function CreateHeart(params, io) {
    params = parseParams([
        "accountID",
        "echoID",
        "commentID",
        "userID"
    ], params);

    try {
        ValidateCreateHeart(params)

        if (params.userID) {
            let likes = await db.collection("hearts").countDocuments({ accountID: params.accountID, userID: { $exists: true } })
            if (likes > 99) throw new Error("Sorry. You can only like up to 100 people.")
        }

        const heartData = {
            heartID: IDGenerator.GenerateHeartID(),
            accountID: params.accountID
        }
        if (params.echoID) heartData.echoID = params.echoID;
        if (params.commentID) heartData.commentID = params.commentID;
        if (params.userID) heartData.userID = params.userID;
        heartData.datetime = Date.now()

        const createHeartResponse = await db.collection("hearts").insertOne(heartData)
        if (createHeartResponse.errors) throw new Error("An error occured when creating heart.");

        const responseData = ResponseClient.DBModifySuccess({
            data: createHeartResponse,
            message: "Heart created successfully."
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateHeartCallback(params, io) {
    if (params.echoID) {
        const echo = await db.collection("echoes").findOne({ echoID: params.echoID })
        if (params.accountID !== echo.accountID) {
            const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
            const echoUserSettings = await db.collection("settings").findOne({ accountID: echo.accountID })
            if (echoUserSettings.echoHeartNotification) {
                await CreateNotification({
                    accountID: echo.accountID,
                    content: `${userAccount.firstName} ${userAccount.lastName} liked your echo.`,
                    image: userAccount.profileImage.url,
                    clickable: true,
                    redirect: echo.url
                }, io)
            }
        }
    }

    if (params.commentID) {
        const comment = await db.collection("comments").findOne({ commentID: params.commentID })
        if (params.accountID !== comment.accountID) {
            const commentUserSettings = await db.collection("settings").findOne({ accountID: comment.accountID })
            const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
            if (commentUserSettings.commentHeartNotification) {
                const echo = await db.collection("echoes").findOne({ echoID: comment.echoID })
                await CreateNotification({
                    accountID: comment.accountID,
                    content: `${userAccount.firstName} ${userAccount.lastName} liked your comment.`,
                    image: userAccount.profileImage.url,
                    clickable: true,
                    redirect: echo.url
                }, io)
            }
        }
    }

    if (params.userID) {
        const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
        await db.collection("accounts").updateOne({ accountID: params.userID }, { $push: { followers: params.accountID } })
        await CreateNotification({
            accountID: params.userID,
            content: `${userAccount.firstName} ${userAccount.lastName} liked your page! Click here to view their profile.`,
            image: userAccount.profileImage.url,
            clickable: true,
            redirect: `${AppConfig.HOST}/user/${userAccount.accountID}`
        }, io)
        
        const reciprocation = await db.collection("hearts").findOne({
            accountID: params.userID,
            userID: params.accountID
        })
        if (reciprocation) {
            const followee = await db.collection("accounts").findOne({ accountID: params.userID })
            await CreateNotification({
                accountID: userAccount.accountID,
                content: `You are now friends with ${followee.firstName} ${followee.lastName}.`,
                image: followee.profileImage.url,
                clickable: true,
                redirect: `${AppConfig.HOST}/user/${followee.accountID}`
            }, io)
            await CreateNotification({
                accountID: followee.accountID,
                content: `${userAccount.firstName} ${userAccount.lastName} liked your page! You are now friends. Click to view their profile.`,
                image: userAccount.profileImage.url,
                clickable: true,
                redirect: `${AppConfig.HOST}/user/${userAccount.accountID}`
            }, io)
        }
    }
}