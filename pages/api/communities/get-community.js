import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetCommunity(data) {
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID")
}

async function GetCommunity (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID"
    ], request.query);

    try {
        ValidateGetCommunity(params);

        let fetchCommunityResponse = await db.collection("communities").findOne({ communityID: params.communityID });
        const echoCount = await db.collection("echoes").countDocuments({ communityID: params.communityID })
        let memberCount = await db.collection("members").countDocuments({ communityID: params.communityID });
        const userMember = await db.collection("members").findOne({ accountID: params.accountID, communityID: params.communityID })
        const userApplied = userMember ? true : await db.collection("applications").findOne({ accountID: params.accountID, communityID: params.communityID })
        const blockedUser = await db.collection("blacklists").findOne({ blocker: params.communityID, blockee: params.accountID })
        let profileImageEcho = fetchCommunityResponse.profileImage.echoID ? await db.collection("echoes").findOne({ echoID: fetchCommunityResponse.profileImage.echoID }) : null
        
        const userCcommunity = {
            communityID: fetchCommunityResponse.communityID,
            name: fetchCommunityResponse.name,
            displayName: fetchCommunityResponse.displayName,
            profileImage: {
                ...fetchCommunityResponse.profileImage,
                echo: profileImageEcho ? {
                    ...profileImageEcho,
                    communityData: {
                        name: fetchCommunityResponse.displayName,
                        node: fetchCommunityResponse.node,
                        profileImage: fetchCommunityResponse.profileImage,
                        userRole: userMember ? userMember.role : null
                    },
                    userData: {
                        firstName: "Community",
                        lastName: "",
                        profileImage: fetchCommunityResponse.profileImage
                    }
                } : null
            },
            profileCover: fetchCommunityResponse.profileCover,
            description: fetchCommunityResponse.description,
            nodes: fetchCommunityResponse.nodes,
            node: fetchCommunityResponse.node,
            echoCount,
            memberCount,
            privacy: fetchCommunityResponse.privacy,
            entryApproval: fetchCommunityResponse.entryApproval,
            echoApproval: fetchCommunityResponse.echoApproval,
            rules: fetchCommunityResponse.rules,
            country: fetchCommunityResponse.country,
            city: fetchCommunityResponse.city,
            website: fetchCommunityResponse.website,
            fSocial: fetchCommunityResponse.fSocial,
            iSocial: fetchCommunityResponse.iSocial,
            tSocial: fetchCommunityResponse.tSocial,
            dateCreated: fetchCommunityResponse.dateCreated,
            communityStatus: fetchCommunityResponse.communityStatus,
            memberCount,
            userMember: userMember ? userMember : false,
            blockedUser: blockedUser ? true : false,
            userApplied: userApplied ? true : false
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: userCcommunity,
            message: "Ccommunity fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetCommunity);