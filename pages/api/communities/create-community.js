import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import AppConfig from "../../../util/config";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import DateGenerator from "../../../services/generators/DateGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateMember from "../community-members/create-community-member";
import CreateNode from "../nodes/create-node";

function ValidateCreateCommunity(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID")
    if (!data.name || data.name.length < 2) throw new Error("Missing or Invalid: name")
    if (!data.description || data.description.length < 2) throw new Error("Missing or Invalid: description")
    if (!data.privacy || !ParamValidator.isValidCommunityPrivacy(data.privacy)) throw new Error("Missing or Invalid: privacy")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateCommunity (request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "name",
        "description",
        "nodes",
        "privacy"
    ], request.body);

    try {
        ValidateCreateCommunity(params)

        let newCommunity = await db.collection("communities").findOne({ name: String(params.name).toLowerCase().replace(/\s/g, "").trim() })
        if (newCommunity) throw new Error("A community with this name already exists.")

        const nodeData = (await axios.post(request.headers.origin + "/api/nodes/create-node", {
            accountID: params.accountID,
            name: params.name,
            emoji: "⚜"
        })).data;

        const communityData = {
            communityID: IDGenerator.GenerateCommunityID(),
            name: String(params.name).toLowerCase().replace(/\s/g, "").trim(),
            displayName: params.name,
            profileImage: {
                publicID: null,
                url: `/images/communityProfile.png`
            },
            profileCover: {
                publicID: null,
                url: `/images/bckg1.jpg`
            },
            description: params.description,
            nodes: [...params.nodes, nodeData.data],
            node: nodeData.data,
            privacy: params.privacy,
            entryApproval: params.privacy === "private" ? true : false,
            echoApproval: false,
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
        response.json(responseData);
        
        response.once("finish", async () => {
            await CreateCommunityCallback(params, request)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function CreateCommunityCallback(params, io, communityData) {
    const { db } = await getDB();
    await db.collection("members").insertOne({
        memberID: IDGenerator.GenerateMemberID(),
        accountID: params.accountID,
        communityID: communityData.communityID,
        role: "admin",
        muted: false,
        status: "active"
    })
    await axios.post(request.headers.origin + "/api/notifications/create-notification", {
        accountID: params.accountID,
        content: `You created a new community! Send an echo to spread the word.`,
        image: `/images/communityProfile.png`,
        clickable: true,
        redirect: `/communities/${communityData.communityID}`
    })
}