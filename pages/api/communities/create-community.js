import { getDB } from "../../../util/db/mongodb";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateMember from "../community-members/create-community-member";

function ValidateCreateCommunity(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.name || data.name.length < 2) throw new Error("Missing or Invalid: name")
    if (!data.description || data.description.length < 2) throw new Error("Missing or Invalid: description")
    if (!data.privacy || !ParamValidator.isValidCommunityPrivacy(data.privacy)) throw new Error("Missing or Invalid: privacy")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function CreateCommunity(params) {
    params = parseParams([
        "accountID",
        "name",
        "description",
        "nodes",
        "privacy"
    ], params);

    try {
        ValidateCreateCommunity(params)

        let newCommunity = await db.collection("communities").findOne({ name: String(params.name).toLowerCase().replace(/\s/g, "").trim() })
        if (newCommunity) throw new Error("A community with this name already exists.")

        const communityData = {
            communityID: IDGenerator.GenerateCommunityID(),
            name: String(params.name).toLowerCase().replace(/\s/g, "").trim(),
            displayName: params.name,
            profileImage: {
                publicID: null,
                url: `/images/profile.jpg`
            },
            profileCover: {
                publicID: null,
                url: `/images/bckg1.jpg`
            },
            description: params.description,
            nodes: params.nodes,
            privacy: params.privacy,
            entryApproval: false,
            echoApproval: false,
            rules: [{
                title: "Be kind and courteous",
                description: "We're all in this together to create a Welcoming environment. Let's treat everyone with respect. Healthy debates are natural, but kindness is required."
            }],
            country: null,
            city: null,
            website: null,
            lastUpdated: Date.now(),
            dateCreated: Date.now(),
            fSocial: null,
            tSocial: null,
            iSocial: null,
            communityStatus: "active"
        }

        const createCommunityResponse = await db.collection("communities").insertOne(communityData)
        if (createCommunityResponse.errors) throw new Error("An error occured when creating community.");

        const responseData = ResponseClient.DBModifySuccess({
            data: communityData,
            message: "Community created successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateCommunityCallback(params, io, communityData) {
    await db.collection("members").insertOne({
        memberID: IDGenerator.GenerateMemberID(),
        accountID: params.accountID,
        communityID: communityData.communityID,
        role: "admin",
        muted: false,
        status: "active"
    })
    await CreateNotification({
        accountID: params.accountID,
        content: `You created a new community! Send an echo to spread the word.`,
        image: `/images/profile.jpg`,
        clickable: true,
        redirect: `${AppConfig.HOST}/communities/${communityData.communityID}`
    }, io)
}