import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";
import IDGenerator from "../../../services/generators/IDGenerator";
import CreateNotification from "../notifications/create-notification";
import CreateHeart from "../hearts/create-heart";
import AppConfig from "../../../util/config";

function ValidateCreateMember(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.communityID || !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

export default async function CreateMember(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "communityID"
    ], params);

    try {
        ValidateCreateMember(params)

        const memberData = {
            memberID: IDGenerator.GenerateMemberID(),
            accountID: params.accountID,
            communityID: params.communityID,
            role: "member",
            muted: false,
            status: "active"
        }

        const createMemberResponse = await db.collection("members").insertOne(memberData)
        if (createMemberResponse.errors) throw new Error("An error occured when creating member.");

        const memberUser = (await db.collection("accounts").findOne({ accountID: params.accountID }))
        const result = {
            ...memberData,
            firstName: memberUser.firstName,
            lastName: memberUser.lastName,
            profileImage: memberUser.profileImage
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: result,
            message: "Member created successfully."
        })
        
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}

export async function CreateMemberCallback(params, io) {
    const { db } = await getDB();
    const user = await db.collection("accounts").findOne({ accountID: params.accountID });
    const community = await db.collection("communities").findOne({ communityID: params.communityID });
    await CreateNotification({
        accountID: user.accountID,
        content: `You joined a new community: ${community.displayName}. Click to view.`,
        image: community.profileImage.url,
        clickable: true,
        redirect: `${AppConfig.HOST}/communities/${community.communityID}`
    }, io)
}