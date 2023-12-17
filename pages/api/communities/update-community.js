import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateUpdateCommunity(data) {
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID")
    if (data.name && data.name.length < 2) throw new Error("Invalid: name.")
    if (data.profileImage && data.profileImage.url && data.profileImage.url.length < 5) throw new Error("Invalid: profile image.")
    if (data.profileCover && data.profileCover.url && data.profileCover.url.length < 5) throw new Error("Invalid: profile cover.")
    if (data.description && data.description.length < 2) throw new Error("Invalid: description.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
    if (data.privacy && !ParamValidator.isValidCommunityPrivacy(data.privacy)) throw new Error("Invalid: privacy.")
    if (data.location) {
        if (!data.location.country || data.location.country.length < 1) throw new Error("Missing or Invalid: location country")
        if (!data.location.state || data.location.state.length < 1) throw new Error("Missing or Invalid: location state")
        if (!data.location.city || data.location.city.length < 1) throw new Error("Missing or Invalid: location city")
    }
    if (data.website && data.website.length < 2) throw new Error("Invalid: website.")
    if (data.communityStatus && !ParamValidator.isValidCommunityStatus(data.communityStatus)) throw new Error("Invalid: community status.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function UpdateCommunity (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "communityID",
        "name",
        "profileImage",
        "profileCover",
        "description",
        "nodes",
        "privacy",
        "entryApproval",
        "echoApproval",
        "country",
        "city",
        "website",
        "communityStatus",
        "lastUpdated",
        "fSocial",
        "iSocial",
        "tSocial"
    ], request.body);

    try {
        ValidateUpdateCommunity(params);

        const updatedCommunity = await db.collection("communities").findOneAndUpdate({ communityID: params.communityID }, {$set: params})
        if (!updatedCommunity) throw new Error("Community does not exist!")

        const responseData = ResponseClient.GenericSuccess({
            data: updatedCommunity,
            message: "Community updated successfully."
        })
        response.json(responseData);
        
        response.once("finish", async () => {
            await UpdateCommunityCallback(params, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function UpdateCommunityCallback(params, request) {
    const { db } = await getDB();
    if (params.nodes) {
        for (let node of params.nodes) {
            const accountNodeCount = await db.collection("accounts").countDocuments({ nodes: { $elemMatch: { nodeID: node.nodeID } } })
            const communityNodeCount = await db.collection("communities").countDocuments({ nodes: { $elemMatch: { nodeID: node.nodeID } } })
            await db.collection("nodes").findOneAndUpdate({ nodeID: node.nodeID }, { $set: { ping: accountNodeCount + communityNodeCount }})
        }
    }
}