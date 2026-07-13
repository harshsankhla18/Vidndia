import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
const largeFileUploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        const response = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(
                localfilepath,
                {
                    resource_type: "video",
                    chunk_size: 6000000
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
        });

        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return response;
    } catch (error) {
        console.log("CLOUDINARY LARGE UPLOAD ERROR:", error);
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }

        return null;
    }
};
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
export { largeFileUploadOnCloudinary,fileUploadOnCloudinary, deleteFromCloudinary };

