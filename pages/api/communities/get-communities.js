import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetCommunities(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function GetCommunities(params) {
    params = parseParams([
        "accountID",
        "userID",
        "member", 
        "page", 
        "pageSize",
        "filter"
    ], params);

    try {
        ValidateGetCommunities(params);
        
        const userAccount = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        let communities = await db.collection("members").find({ accountID: params.userID }).toArray()
        if (!userAccount) throw new Error("Account does not exist.")

        const filters = { 
            nodes: { $elemMatch: { nodeID: { $in: userAccount.nodes.map((node) => node.nodeID) } } }
        }
        if (params.member) filters.communityID = { $in: communities.map((obj) => obj.communityID) }
        else filters.communityID = { $nin: communities.map((obj) => obj.communityID) }
        if (params.filter) filters.name = { $regex: String(params.filter).toLowerCase().replace(/\s/g, "").trim(), $options: 'i' }

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
            const memberCount = await db.collection("members").countDocuments({ communityID: community.communityID })
            const userMember = await db.collection("members").findOne({ accountID: params.accountID, communityID: community.communityID })
            const userBlocked = await db.collection("blacklist").findOne({ blocker: params.communityID, blockee: params.accountID })
            communityList.push({
                ...community,
                memberCount,
                userMember: userMember ? true : false,
                userBlocked: userBlocked ? true : false
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

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}