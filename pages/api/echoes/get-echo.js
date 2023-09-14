import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetEcho(data) {
    if (data.echoID && !ParamValidator.isValidObjectID(data.echoID)) throw new Error("Invalid: echoID.")
    if (data.communityID && !ParamValidator.isValidObjectID(data.communityID)) throw new Error("Invalid: communityID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetEcho(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "echoID",
        "communityID"
    ], params);

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

        const finalEchoData = {
            ...echo,
            comments: commentCount,
            hearts: heartCount,
            userHearted: userHearted ? true : false,
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
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}