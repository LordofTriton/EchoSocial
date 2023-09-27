import ResponseClient from "../../../services/validation/ResponseClient";
import CloudinaryService from "../../../services/CloudinaryService";
import multer from 'multer';
import fs from 'fs';
import mime from "mime";

const upload = multer({ dest: 'uploads/' });

export const config = {
    api: {
        bodyParser: false,
    },
};

function parseParams(data) {
    const { accountID, echoID, content, repliedTo } = data;
    return { accountID, echoID, content, repliedTo };
}

export default async (req, res) => {
    // Use the 'upload' middleware to handle file uploads and store the files temporarily in 'uploads/' directory
    const responseData = await new Promise((resolve, reject) => {
        upload.array('media')(req, res, async (err) => {
            if (err) {
                console.log("Upload Error: ", err);
                const responseData = ResponseClient.GenericFailure({ error: err.message });
                resolve(responseData);
                return;
            }

            try {
                const files = req.files;
                
                const uploadedFiles = await Promise.all(
                    files.map((file) => CloudinaryService.UploadFile(file.path))
                );

                cleanupTemporaryFiles(files);

                const responseData = ResponseClient.DBModifySuccess({
                    data: uploadedFiles.map((file) => {return {publicID: file.public_id, url: file.url}}),
                    message: "Files uploaded successfully.",
                });
                resolve(responseData);
            } catch (error) {
                console.log(error);
                const responseData = ResponseClient.GenericFailure({ error: error.message });
                resolve(responseData);
            }
        });
    });

    res.json(responseData)
};

function readFileAsDataURL(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(new Error("Failed to read the file."));
            } else {
                // Convert file data to Data URL format (Base64 encoded)
                const base64Data = data.toString('base64');
                const dataURL = `data:${mime.getType(filePath)};base64,${base64Data}`;
                resolve(dataURL);
            }
        });
    });
}

function cleanupTemporaryFiles(files) {
    // Remove the temporary files after processing
    files.forEach((file) => {
        fs.unlink(file.path, (err) => {
            if (err) {
                console.log(`Failed to delete temporary file ${file.path}: ${err.message}`);
            }
        });
    });
}