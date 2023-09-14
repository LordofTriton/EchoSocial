import { getDB } from "../../../util/db/mongodb";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetNodes(data) {
    if (data.filter && data.filter.length < 2) throw new Error("Invalid filter.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetNodes(params, io) {
    const { db } = await getDB();
    params = parseParams([
        "accountID",
        "filter",
        "page",
        "pageSize"
    ], params);

    try {
        ValidateGetNodes(params)

        const filter = {}
        if (params.filter) filter.name = { $regex: params.filter, $options: 'i' }

        const pagination = {
            page: parseInt(params.page),
            pageSize: parseInt(params.pageSize)
        }

        const skip = (pagination.page - 1) * pagination.pageSize;

        let fetchNodesResponse = await db.collection("nodes").find(filter).sort({ pings: -1 }).skip(skip).limit(pagination.pageSize).toArray();
        if (fetchNodesResponse.length < 1) fetchNodesResponse = [];

        const responseData = ResponseClient.DBModifySuccess({
            data: fetchNodesResponse,
            message: "Nodes fetched successfully."
        })
        return responseData;
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        return responseData;
    }
}