import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
const fileUploadOnCloudinary = async (localfilepath) => {
    try{
        if(!localfilepath) return null;
        const response= await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        fs.unlinkSync(localfilepath);
        return response;

    }catch(error){
        fs.unlinkSync(localfilepath);
        return null;
    }
}
const deleteFromCloudinary = async (public_id) => {
   try {
     await cloudinary.uploader.destroy(public_id);
   } catch (error) {
        throw new ApiError(500,error?.message || "Error While Deleting from Cloudinary");
   }
}
export { fileUploadOnCloudinary, deleteFromCloudinary };

