import { getDB } from "../../../util/db/mongodb";
import axios from "axios";
import { authenticate } from "../auth/authenticate";
import ResponseClient from "../../../services/validation/ResponseClient";
import CloudinaryService from "../../../services/CloudinaryService";

function ValidateDeleteFile(data) {
    if (!data.publicID || data.publicID.length < 3) throw new Error("Missing or Invalid: publicID")
}

function parseParams(data) {
    const { accountID, echoID, content, repliedTo } = data;
    return { accountID, echoID, content, repliedTo };
}

async function DeleteFile (request, response, authToken) {
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

export default authenticate(DeleteFile);