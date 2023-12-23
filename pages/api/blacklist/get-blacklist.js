import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetBlacklists(data) {
    if (!data.accountID || !ParamValidator.isValidAccountID(data.accountID)) throw new Error("Missing or Invalid: accountID.")
    if (!data.blocker || !ParamValidator.isValidObjectID(data.blocker)) throw new Error("Invalid: blocker.")
}

export default async function GetBlacklist (request, response) {
    const { db } = await getDB();
    let params = ParamValidator.parseParams([
        "accountID",
        "blocker",
        "blockeeType",
        "page",
        "pageSize"
    ], request.query);

    try {
        ValidateGetBlacklists(params);

        const filters = {
            blocker: params.blocker
        }
        if (params.blockeeType) filters.blockeeType = params.blockeeType;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchBlacklistsResponse = await db.collection("blacklists").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const blacklistCount = await db.collection("blacklists").countDocuments(filters);
        if (fetchBlacklistsResponse.length < 1) fetchBlacklistsResponse = [];

        let blacklistData = []
        for (let blacklist of fetchBlacklistsResponse) {
            const user = await db.collection("accounts").findOne({ accountID: blacklist.blockee })
            const finalBlacklistData = {
                ...blacklist,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            blacklistData.push(finalBlacklistData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: blacklistData.reverse(),
            message: "Blacklists fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: blacklistCount,
            pagination: true
        })
        
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}