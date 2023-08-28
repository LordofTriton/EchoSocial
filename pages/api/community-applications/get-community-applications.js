import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetApplications(data) {
    if (!data.communityID || !ParamValidator.isValidAccountID(data.communityID)) throw new Error("Missing or Invalid: communityID.")
    if (data.applicationID && !ParamValidator.isValidObjectID(data.applicationID)) throw new Error("Invalid: applicationID.")
    if (data.nodes && data.nodes.length < 1) throw new Error("Invalid: nodes.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param]) result[param] = data[param]
    }
    return result;
}

const { db } = await getDB();

export default async function GetApplications(params, io) {
    params = parseParams([
        "accountID",
        "applicationID",
        "communityID",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetApplications(params);

        const filters = {}
        if (params.applicationID) filters.applicationID = params.applicationID;
        if (params.communityID) filters.communityID = params.communityID;

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchApplicationsResponse = await db.collection("applications").find(filters).sort({ datetime: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        const applicationCount = await db.collection("applications").countDocuments(filters);
        if (fetchApplicationsResponse.length < 1) fetchApplicationsResponse = [];

        let applicationData = []
        for (let application of fetchApplicationsResponse) {
            const user = (await db.collection("accounts").findOne({ accountID: application.accountID }))
            let heartCount = await db.collection("hearts").countDocuments({ applicationID: application.applicationID });
            let userHearted = await db.collection("hearts").findOne({ accountID: params.accountID, applicationID: params.applicationID });

            const finalApplicationData = {
                ...application,
                hearts: heartCount,
                userHearted: userHearted ? true : false,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage
            }
            applicationData.push(finalApplicationData);
        }

        const responseData = ResponseClient.DBFetchSuccess({
            data: applicationData.reverse(),
            message: "Applications fetched successfully.",
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalItems: applicationCount,
            pagination: true
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}