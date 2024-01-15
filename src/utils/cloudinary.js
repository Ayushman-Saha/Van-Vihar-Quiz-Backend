import {v2 as cloudinary} from "cloudinary"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            eager: [
             {quality:  30,}
            ]
        })
        return response;
        

    } catch (error) {
        return null;

    }
}



export {uploadOnCloudinary}