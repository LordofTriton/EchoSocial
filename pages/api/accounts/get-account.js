import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetAccount(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.userID && !ParamValidator.isValidAccountID(data.userID)) throw new Error("Invalid: userID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function GetAccount(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "userID"
    ], params);

    try {
        ValidateGetAccount(params);

        const filters = {}
        if (params.userID) filters.accountID = params.userID;
        else filters.accountID = params.accountID;

        let fetchAccountResponse = await db.collection("accounts").findOne(filters);

        let communityMembership = await db.collection("members").find({ accountID: filters.accountID }).toArray()
        let communities = await db.collection("communities").find({ communityID: { $in: communityMembership.map((obj) => obj.communityID) } }).toArray()

        let heartCount = await db.collection("hearts").countDocuments({ userID: filters.accountID });
        let userHearted = params.userID && params.userID !== params.accountID ? await db.collection("hearts").findOne({ accountID: params.accountID, userID: params.userID }) : false;
        let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: fetchAccountResponse.accountID })
        let userLikee = await db.collection("hearts").findOne({ accountID: fetchAccountResponse.accountID, userID: params.accountID })
        
        const userAccount = {
            accountID: fetchAccountResponse.accountID,
            firstName: fetchAccountResponse.firstName,
            lastName: fetchAccountResponse.lastName,
            nickname: fetchAccountResponse.nickname,
            email: fetchAccountResponse.email,
            profileImage: fetchAccountResponse.profileImage,
            profileCover: fetchAccountResponse.profileCover,
            gender: fetchAccountResponse.gender,
            phone: fetchAccountResponse.phone,
            nodes: fetchAccountResponse.nodes,
            communities: communities.map((community) => { return { 
                communityID: community.communityID, 
                displayName: community.displayName, 
                profileImage: community.profileImage,
                profileCover: community.profileCover
            } }),
            bio: fetchAccountResponse.bio,
            hearts: heartCount ? heartCount : 0,
            userHearted: userHearted ? true : false,
            dateOfBirth: fetchAccountResponse.dateOfBirth,
            country: fetchAccountResponse.country,
            city: fetchAccountResponse.city,
            maritalStatus: fetchAccountResponse.maritalStatus,
            occupation: fetchAccountResponse.occupation,
            emailConfirmed: fetchAccountResponse.emailConfirmed,
            phoneNumberConfirmed: fetchAccountResponse.phoneNumberConfirmed,
            fSocial: fetchAccountResponse.fSocial,
            tSocial: fetchAccountResponse.tSocial,
            iSocial: fetchAccountResponse.iSocial,
            userRole: fetchAccountResponse.userRole,
            lastLogin: fetchAccountResponse.lastLogin,
            lastActive: fetchAccountResponse.lastActive,
            userStatus: fetchAccountResponse.userStatus,
            isVerified: fetchAccountResponse.isVerified,
            userLiked: userLiked ? true : false,
            userLikee: userLikee ? true : false,
            userFriend: userLiked && userLikee ? true : false
        }

        const responseData = ResponseClient.GenericSuccess({
            data: userAccount,
            message: "Account fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}