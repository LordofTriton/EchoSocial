import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
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

async function CreateCommunityMember (request, response, authToken) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "communityID"
    ], request.body);

    try {
        ValidateCreateMember(params)
        console.log(params)

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
            const user = await db.collection("accounts").findOne({ accountID: params.accountID });
            const community = await db.collection("communities").findOne({ communityID: params.communityID });
            await axios.post(AppConfig.HOST + "/api/notifications/create-notification", {
                accountID: user.accountID,
                content: `You joined a new community: ${community.displayName}. Click to view.`,
                image: community.profileImage.url,
                clickable: true,
                redirect: `/communities/${community.communityID}`
            }, { headers: { Authorization: `Bearer ${authToken}` } })
            await db.collection("nodes").findOneAndUpdate({ nodeID: community.node.nodeID }, { $inc: { pings: 1 }})
        })
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(CreateCommunityMember);