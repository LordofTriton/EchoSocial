import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetCommunities(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetCommunities (request, response) {
    const { db } = await getDB();
    let params = request.query;

    try {
        ValidateGetCommunities(params);
        if (!params.userID) params.userID = params.accountID;
        
        const userAccount = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        let communities = await db.collection("members").find({ accountID: params.userID }).toArray()
        if (!userAccount) throw new Error("Account does not exist.")

        const filters = { 
            $and: []
        }
        if (params.userID !== params.accountID) filters.$and.push({ nodes: { $elemMatch: { nodeID: { $in: userAccount.nodes.map((node) => node.nodeID) } } } })

        if (params.member === true) filters.$and.push({ communityID: { $in: communities.map((obj) => obj.communityID) } })
        if (params.member === false) {
            if (params.userID === params.accountID) filters.$and.push({ nodes: { $elemMatch: { nodeID: { $in: userAccount.nodes.map((node) => node.nodeID) } } } })
            filters.$and.push({ communityID: { $nin: communities.map((obj) => obj.communityID) } })
        }
        
        if (params.filter) filters.$and.push({ name: { $regex: String(params.filter).toLowerCase().replace(/\s/g, "").trim(), $options: 'i' } })

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchCommunitysResponse = await db.collection("communities").find(filters).sort({ lastUpdated: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const communityCount = await db.collection("communities").countDocuments(filters);
        if (fetchCommunitysResponse.length < 1) fetchCommunitysResponse = [];

        let communityList = []
        for (let community of fetchCommunitysResponse) {
            const echoCount = await db.collection("echoes").countDocuments({ communityID: community.communityID })
            const memberCount = await db.collection("members").countDocuments({ communityID: community.communityID })
            const userMember = await db.collection("members").findOne({ accountID: params.accountID, communityID: community.communityID })
            const userApplied = userMember ? true : await db.collection("applications").findOne({ accountID: params.accountID, communityID: community.communityID })
            const blockedUser = await db.collection("blacklists").findOne({ blocker: community.communityID, blockee: params.accountID })

            communityList.push({
                ...community,
                echoCount,
                memberCount,
                userMember: userMember ? true : false,
                blockedUser: blockedUser ? true : false,
                userApplied: userApplied ? true: false
            })
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: communityList,
            message: "Communities fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: communityCount,
            pagination: true
        })

        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}