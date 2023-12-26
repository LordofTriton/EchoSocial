import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetEcho(data) {
    if (data.echoID && !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Invalid: echoID.")
    if (data.communityID && !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Invalid: communityID.")
}

async function GetEcho(request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "echoID",
        "communityID"
    ], request.query);

    try {
        ValidateGetEcho(params);

        let communities = await db.collection("members").find({ accountID: params.accountID }).toArray()
        let blacklist = await db.collection("blacklists").find({ $or: [{ blocker: params.accountID }, { blockee: params.accountID } ] }).toArray()
        let friendsList = (await db.collection("friends").find({ accountID: params.accountID }).toArray()).map((friend) => friend.friendID)

        let echo = await db.collection("echoes").findOne({ echoID: params.echoID });

        if (echo.communityID) {
            if (!communities.map((obj) => obj.communityID).includes(echo.communityID)) throw new Error("You cannot view this Echo.")
            if (blacklist.map((obj) => obj.blockee).includes(echo.communityID) || blacklist.map((obj) => obj.blocker).includes(echo.communityID)) throw new Error("You cannot view this Echo.")
        }
        if (echo.audience === "private" && echo.account !== params.accountID) throw new Error("This echo is private.")
        if (echo.audience === "friends" && !friendsList.includes(echo.accountID)) throw new Error("You cannot view this Echo.")
        if (blacklist.map((obj) => obj.blockee).includes(echo.accountID) || blacklist.map((obj) => obj.blocker).includes(echo.accountID)) throw new Error("You cannot view this Echo.")

        let echoUser = await db.collection("accounts").findOne({ accountID: echo.accountID })
        let commentCount = await db.collection("comments").countDocuments({ echoID: echo.echoID })
        const community = echo.communityID ? communities.find((community) => community.communityID === echo.communityID) : null
        const communityMember = community ? await db.collection("members").findOne({ communityID: echo.communityID, accountID: params.accountID }) : null
        let heartCount = await db.collection("hearts").countDocuments({ echoID: echo.echoID });
        let userHearted = await db.collection("hearts").findOne({ accountID: params.accountID, echoID: echo.echoID });
        let userSaved = await db.collection("saves").findOne({ accountID: params.accountID, echoID: echo.echoID });

        let finalEchoData = {
            ...echo,
            comments: commentCount,
            hearts: heartCount,
            userHearted: userHearted ? true : false,
            userSaved: userSaved ? true : false,
            userData: {
                firstName: echoUser.firstName,
                lastName: echoUser.lastName,
                profileImage: echoUser.profileImage
            },
            communityData: {
                name: community ? community.displayName : null,
                node: community ? community.node : null,
                profileImage: community ? community.profileImage : null,
                userRole: communityMember ? communityMember.role : null
            }
        }

        const responseData = ResponseClient.DBModifySuccess({
            data: finalEchoData,
            message: "Echo fetched successfully."
        })
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}

export default authenticate(GetEcho);