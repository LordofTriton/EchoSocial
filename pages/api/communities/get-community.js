import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetCommunity(data) {
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function GetCommunity(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID"
    ], params);

    try {
        ValidateGetCommunity(params);

        let fetchCommunityResponse = await db.collection("communities").findOne({ communityID: params.communityID });
        let memberCount = await db.collection("members").countDocuments({ communityID: params.communityID });
        const userMember = await db.collection("members").findOne({ accountID: params.accountID, communityID: params.communityID })
        const userBlocked = await db.collection("blacklist").findOne({ blocker: params.communityID, blockee: params.accountID })
        
        const userCcommunity = {
            communityID: fetchCommunityResponse.communityID,
            name: fetchCommunityResponse.name,
            displayName: fetchCommunityResponse.displayName,
            profileImage: fetchCommunityResponse.profileImage,
            profileCover: fetchCommunityResponse.profileCover,
            description: fetchCommunityResponse.description,
            nodes: fetchCommunityResponse.nodes,
            memberCount,
            applications: fetchCommunityResponse.applications,
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
            userBlocked: userBlocked ? true : false
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: userCcommunity,
            message: "Ccommunity fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}