import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetAccounts(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.email && !ParamValidator.isValidEmail(data.email)) throw new Error("Invalid: email.")
    if (!data.email && !data.accountID) throw new Error("Requires email or accountID.")
    if (!data.page || data.page < 1) throw new Error("Missing or Invalid: page")
    if (!data.pageSize || data.pageSize < 1) throw new Error("Missing or Invalid: page")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetAccounts (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "friends",
        "filter",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetAccounts(params);

        const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID}] }).toArray()
        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)

        const filters = {
            $and: [
                { accountID: { $nin: blacklist.filter((blck) => blck.blocker === params.accountID).map((obj) => obj.blockee) } },
                { accountID: { $nin: blacklist.filter((blck) => blck.blockee === params.accountID).map((obj) => obj.blocker) } } 
            ],
            $or: []
        }
        if (params.friends === 'true') filters.accountID = { $in: friendsList }
        if (params.friends === 'false') filters.accountID = { $nin: friendsList, $ne: params.accountID }

        if (params.filter) {
            filters.$or.push({ firstName: { $regex: params.filter, $options: 'i' } })
            filters.$or.push({ lastName: { $regex: params.filter, $options: 'i' } })
        }
        else {
            filters.$or.push({ nodes: { $elemMatch: { nodeID: { $in: userAccount.nodes.map((node) => node.nodeID) } } } })
        }

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchAccountsResponse = await db.collection("accounts").find(filters).skip(skip).limit(pagination.pageSize).toArray();
        const accountCount = await db.collection("accounts").countDocuments(filters);
        if (fetchAccountsResponse.length < 1) fetchAccountsResponse = [];

        const accountData = []
        for (let account of fetchAccountsResponse) {
            let settings = await db.collection("settings").findOne({ accountID: account.accountID })
            if (params.filter && !settings.showInSearch) continue;
            let heartCount = await db.collection("hearts").countDocuments({ userID: account.accountID });
            let userHearted = params.userID && params.userID !== params.accountID ? await db.collection("hearts").findOne({ accountID: params.accountID, userID: account.accountID }) : false;
            let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: account.accountID })
            let userLikee = await db.collection("hearts").findOne({ accountID: account.accountID, userID: params.accountID })
            let communityMembership = await db.collection("members").find({ accountID: account.accountID }).toArray()
            let communities = await db.collection("communities").find({ communityID: { $in: communityMembership.map((obj) => obj.communityID) } }).toArray()
            let chat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: account.accountID })
            
            accountData.push({
                accountID: account.accountID,
                firstName: account.firstName,
                lastName: account.lastName,
                nickname: account.nickname,
                email: account.email,
                profileImage: account.profileImage,
                profileCover: account.profileCover,
                gender: account.gender,
                phone: account.phone,
                nodes: account.nodes,
                communities: communities.map((community) => { return { 
                    communityID: community.communityID, 
                    displayName: community.displayName, 
                    profileImage: community.profileImage,
                    profileCover: community.profileCover
                } }),
                bio: account.bio,
                hearts: heartCount ? heartCount : 0,
                userHearted: userHearted ? true : false,
                dateOfBirth: account.dateOfBirth,
                country: account.country,
                city: account.city,
                maritalStatus: account.maritalStatus,
                occupation: account.occupation,
                emailConfirmed: account.emailConfirmed,
                phoneNumberConfirmed: account.phoneNumberConfirmed,
                fSocial: account.fSocial,
                tSocial: account.tSocial,
                iSocial: account.iSocial,
                settings,
                userRole: account.userRole,
                lastLogin: account.lastLogin,
                lastActive: account.lastActive,
                userStatus: account.userStatus,
                isVerified: account.isVerified,
                userChat: chat ? {
                    ...chat,
                    origin: {
                        accountID: userAccount.accountID,
                        firstName: userAccount.firstName,
                        lastName: userAccount.lastName,
                        profileImage: userAccount.profileImage
                    },
                    target: {
                        accountID: account.accountID,
                        firstName: account.firstName,
                        lastName: account.lastName,
                        profileImage: account.profileImage
                    }
                } : null,
                userLiked: userLiked ? true : false,
                userLikee: userLikee ? true : false,
                userFriend: userLiked && userLikee ? true : false
            })
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: accountData,
            message: "Account(s) fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: accountCount,
            pagination: true
        })

        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}