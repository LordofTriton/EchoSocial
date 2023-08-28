import { getDB } from "../../../util/db/mongodb";
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
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function GetAccounts(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "friends",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetAccounts(params);

        const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
        let friendsList = (await db.collection("hearts").find({
            $or: [
                { accountID: params.accountID, userID: { $exists: true } },
                { userID: params.accountID }
            ]
        }).toArray())
        friendsList = friendsList.filter((friend) => friendsList.map((item) => item.userID).includes(friend.accountID)).map((obj) => obj.accountID).filter((x) => x !== params.accountID)

        const filters = {
            nodes: { $elemMatch: { nodeID: { $in: userAccount.nodes.map((node) => node.nodeID) } } }
        }
        if (params.friends) filters.accountID = { $in: friendsList }
        else filters.accountID = { $nin: friendsList }

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
            let heartCount = await db.collection("hearts").countDocuments({ userID: account.accountID });
            let userHearted = params.userID && params.userID !== params.accountID ? await db.collection("hearts").findOne({ accountID: params.accountID, userID: account.accountID }) : false;
            let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: account.accountID })
            let userLikee = await db.collection("hearts").findOne({ accountID: account.accountID, userID: params.accountID })
            let communityMembership = await db.collection("members").find({ accountID: account.accountID }).toArray()
            let communities = await db.collection("communities").find({ communityID: { $in: communityMembership.map((obj) => obj.communityID) } }).toArray()
            
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
                userRole: account.userRole,
                lastLogin: account.lastLogin,
                lastActive: account.lastActive,
                userStatus: account.userStatus,
                isVerified: account.isVerified,
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

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}