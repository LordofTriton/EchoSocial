import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
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

export default async function CreateCommunityMember (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID"
    ], request.body);

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
        
        response.json(responseData);
        
        response.once("finish", async () => {
            await CreateMemberCallback(params, AppConfig.HOST)
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export async function CreateMemberCallback(params, reqOrigin) {
    const { db } = await getDB();
    const user = await db.collection("accounts").findOne({ accountID: params.accountID });
    const community = await db.collection("communities").findOne({ communityID: params.communityID });
    await axios.post(reqOrigin + "/api/notifications/create-notification", {
        accountID: user.accountID,
        content: `You joined a new community: ${community.displayName}. Click to view.`,
        image: community.profileImage.url,
        clickable: true,
        redirect: `/communities/${community.communityID}`
    })
    await db.collection("nodes").findOneAndUpdate({ nodeID: community.node.nodeID }, { $inc: { pings: 1 }})
}