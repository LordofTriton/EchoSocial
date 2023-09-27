import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import AppConfig from "../../../util/config";
import CreateHeart from "../hearts/create-heart";

function ValidateCreateEcho(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (data.communityID && !ParamValidator.isValidAccountID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
    if (!data.content) throw new Error("Missing or Invalid: content.")
    if (data.content) {
        if (data.content.text && data.content.text.length < 2) throw new Error("Missing or Invalid: content text.")
    }
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function CreateEcho(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID",
        "audience",
        "nodes",
        "content",
        "shared"
    ], params);

    try {
        ValidateCreateEcho(params)
        const echoID = IDGenerator.GenerateEchoID()

        const echoData = {
            echoID,
            accountID: params.accountID,
            communityID: params.communityID,
            audience: params.audience,
            nodes: params.nodes,
            content: {
                text: params.content.text,
                media: params.content.media,
                link: params.content.link
            },
            shared: params.shared,
            datetime: Date.now(),
            url: `/${params.communityID ? "communities" : "user"}/${params.communityID ? params.communityID : params.accountID}?echo=${echoID}`
        }

        const createEchoResponse = await db.collection("echoes").insertOne(echoData)
        if (createEchoResponse.errors) throw new Error("An error occured when creating echo.");

        const createdEcho = await db.collection("echoes").findOne({ echoID: echoData.echoID })
        const responseData = ResponseClient.DBModifySuccess({
            data: createdEcho,
            message: "Echo created successfully."
        })

        await CreateHeart({
            accountID: params.accountID,
            echoID: echoData.echoID
        })

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateEchoCallback(params, io) {
    const { db } = await getDB();
    if (params.communityID) {
        await db.collection("communities").updateOne({ communityID: params.communityID }, { $set: { lastUpdated: Date.now() } })
    }
}