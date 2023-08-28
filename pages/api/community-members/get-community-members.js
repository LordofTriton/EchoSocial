import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetMembers(data) {
    if (!data.communityID || !ParamValidator.isValidAccountID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
    if (data.userID && !ParamValidator.isValidObjectID(data.userID)) throw new Error("Invalid: userID.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function GetMembers(params, io) {
    params = parseParams([
        "accountID",
        "userID",
        "communityID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetMembers(params);

        const filters = {}
        if (params.userID) filters.accountID = params.userID;
        if (params.communityID) filters.communityID = params.communityID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchMembersResponse = await db.collection("members").find(filters).sort({ datetime: 1 }).skip(skip).limit(pagination.pageSize).toArray();
        const memberCount = await db.collection("members").countDocuments(filters);
        if (fetchMembersResponse.length < 1) fetchMembersResponse = [];

        let memberData = []
        for (let member of fetchMembersResponse) {
            const user = (await db.collection("accounts").findOne({ accountID: member.accountID }))
            let heartCount = await db.collection("hearts").countDocuments({ userID: member.userID });
            let userLiked = await db.collection("hearts").findOne({ accountID: params.accountID, userID: member.accountID })
            let userLikee = await db.collection("hearts").findOne({ accountID: member.accountID, userID: params.accountID })

            const finalMemberData = {
                ...member,
                hearts: heartCount,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                profileCover: user.profileCover,
                nickname: user.nickname,
                userLiked: userLiked ? true : false,
                userLikee: userLikee ? true : false,
                userFriend: userLiked && userLikee ? true : false
            }
            memberData.push(finalMemberData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: memberData.reverse(),
            message: "Members fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: memberCount,
            pagination: true
        })

        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}