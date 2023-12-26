import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetAccount(data) {
    if (data.accountID && !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Invalid: accountID.")
    if (data.userID && !ParamValidator.isValidAccountID(data.userID)) throw new Error("Invalid: userID.")
}

async function GetAccount (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "userID"
    ], request.query);

    try {
        ValidateGetAccount(params);
        if (!params.userID) params.userID = params.accountID;

        const userAccount = await db.collection("accounts").findOne({ accountID: params.accountID })
        let userBlockCheck = await db.collection("blacklists").findOne({ blocker: params.accountID, blockee: params.userID })
        let blockedUserCheck = await db.collection("blacklists").findOne({ blocker: params.userID, blockee: params.accountID })

        let fetchAccountResponse = await db.collection("accounts").findOne({ accountID: params.userID });

        let communityMembership = await db.collection("members").find({ accountID: params.userID }).toArray()
        let communities = await db.collection("communities").find({ communityID: { $in: communityMembership.map((obj) => obj.communityID) } }).toArray()

        let heartCount = await db.collection("hearts").countDocuments({ userID: params.userID });
        let userHearted = params.userID && params.userID !== params.accountID ? await db.collection("hearts").findOne({ accountID: params.accountID, userID: params.userID }) : false;
        let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: fetchAccountResponse.accountID })
        let userLikee = await db.collection("hearts").findOne({ accountID: fetchAccountResponse.accountID, userID: params.accountID })
        let chat = await db.collection("chats").findOne({ accountID: params.accountID, targetID: fetchAccountResponse.accountID })
        let settings = await db.collection("settings").findOne({ accountID: params.userID })
        let profileImageEcho = fetchAccountResponse.profileImage.echoID ? await db.collection("echoes").findOne({ echoID: fetchAccountResponse.profileImage.echoID }) : null
        
        const userData = {
            accountID: fetchAccountResponse.accountID,
            firstName: fetchAccountResponse.firstName,
            lastName: fetchAccountResponse.lastName,
            nickname: fetchAccountResponse.nickname,
            email: fetchAccountResponse.email,
            profileImage: {
                ...fetchAccountResponse.profileImage,
                echo: profileImageEcho ? {
                    ...profileImageEcho,
                    userData: {
                        firstName: fetchAccountResponse.firstName,
                        lastName: fetchAccountResponse.lastName,
                        profileImage: fetchAccountResponse.profileImage
                    }
                } : null
            },
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
            settings,
            userRole: fetchAccountResponse.userRole,
            lastLogin: fetchAccountResponse.lastLogin,
            lastActive: fetchAccountResponse.lastActive,
            userStatus: fetchAccountResponse.userStatus,
            isVerified: fetchAccountResponse.isVerified,
            userChat: chat ? {
                ...chat,
                origin: {
                    accountID: userAccount.accountID,
                    firstName: userAccount.firstName,
                    lastName: userAccount.lastName,
                    profileImage: userAccount.profileImage
                },
                target: {
                    accountID: fetchAccountResponse.accountID,
                    firstName: fetchAccountResponse.firstName,
                    lastName: fetchAccountResponse.lastName,
                    profileImage: fetchAccountResponse.profileImage
                }
            } : null,
            userLiked: userLiked ? true : false,
            userLikee: userLikee ? true : false,
            userFriend: userLiked && userLikee ? true : false,
            userBlocked: userBlockCheck ? true : false,
            blockedUser: blockedUserCheck ? true : false
        }

        const responseData = ResponseClient.GenericSuccess({
            data: userData,
            message: "Account fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetAccount);