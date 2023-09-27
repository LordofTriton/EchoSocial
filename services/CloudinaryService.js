const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function UploadFile(fileData) {
    return cloudinary.v2.uploader.upload(fileData, { 
        resource_type: 'auto'
     })
}

async function DeleteFile(publicID) {
    return cloudinary.v2.uploader.destroy(publicID)
}

const CloudinaryService = {
    UploadFile,
    DeleteFile
}

export default CloudinaryService;