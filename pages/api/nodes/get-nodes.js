import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import ParamValidator from "../../../services/validation/validator";
import ResponseClient from "../../../services/validation/ResponseClient";

function ValidateGetNodes(data) {
    if (data.filter && data.filter.length < 2) throw new Error("Invalid filter.")
}

function parseParams(params, data) {
    const result = {}
    for (let param of params) {
        if (data[param] === 'null') return;
        if (data[param] || data[param] === 0 || data[param] === false) result[param] = data[param]
    }
    return result;
}

export default async function GetNodes(request, response) {
    const { db } = await getDB();
    let params = parseParams([
        "accountID",
        "filter",
        "page",
        "pageSize"
    ], request.query);

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
        response.json(responseData);
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData);
    }
}