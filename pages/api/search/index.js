import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";

function ValidateCreateComment(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.query || data.query.length < 2) throw new Error("Missing or Invalid: query")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function Search(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "query"
    ], params);

    try {
        ValidateSearch(params)

        const userAccount = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        let communities = await db.collection("members").find({ accountID: params.accountID }).toArray()
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID}] }).toArray()
        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)
        if (!userAccount) throw new Error("Account does not exist.")

        let echoFilters = { 
            "content.text": { $regex: params.query, $options: 'i' },
            $or: [ 
                { nodes: { $in: params.nodes ? params.nodes : userAccount.nodes.map((node) => node.nodeID) } }, 
                { communityID: { $in: communities.map((obj) => obj.communityID) } } 
            ],
            $and: [ 
                { $or: [ { communityID: { $in: communities.map((obj) => obj.communityID) } }, { audience: "public" }, { audience: "friends", accountID: { $in: friendsList } }, { accountID: params.accountID } ] },
                { accountID: { $nin: blacklist.map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.map((obj) => obj.blocker) } } 
            ]
        }
        let peopleFilters = {
            $or: [
                { firstName: { $regex: params.query, $options: 'i' } },
                { lastName: { $regex: params.query, $options: 'i' } },
                { nickname: { $regex: params.query, $options: 'i' } }
            ],
            $and: [ 
                { accountID: { $nin: blacklist.map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.map((obj) => obj.blocker) } } 
            ]
        }
        let communityFilters = {
            $or: [
                { displayName: { $regex: params.query, $options: 'i' } },
                { description: { $regex: params.query, $options: 'i' } }
            ],
            $and: [ 
                { accountID: { $nin: blacklist.map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.map((obj) => obj.blocker) } } 
            ]
        }

        const echoResults = await db.collection("echoes").find(echoFilters).toArray()
        const peopleResults = await db.collection("accounts").find(peopleFilters).toArray()
        const communityResults = await db.collection("communities").find(communityFilters).toArray()

        const finalEchoResults = []
        for (let echo of echoResults) {
            
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Search results fetched successfully."
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