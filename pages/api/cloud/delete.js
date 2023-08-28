import { getDB } from "../../../util/db/mongodb";
import ResponseClient from "../../../services/validation/ResponseClient";
import CloudinaryService from "../../../services/CloudinaryService";

function ValidateDeleteFile(data) {
    if (!data.publicID || data.publicID.length < 3) throw new Error("Missing or Invalid: publicID")
}

function parseParams(data) {
    const { accountID, echoID, content, repliedTo } = data;
    return { accountID, echoID, content, repliedTo };
}

export default async (request, response) => {
    let params = request.query;

    try {
        ValidateDeleteFile(params)

        const deleteFileResponse = await CloudinaryService.DeleteFile(params.publicID)

        const responseData = ResponseClient.DBModifySuccess({
            data: deleteFileResponse,
            message: "File deleted successfully."
        })
        response.json(responseData)
    } catch (error) {
        console.log(error)
        const responseData = ResponseClient.GenericFailure({ error: error.message })
        response.json(responseData)
    }
}