import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if(!title?.trim()){
        throw new ApiError(400,"Video Title cannot be empty");
    }
    const localThumbnailPath = req.files?.thumbnailToUpload[0].path;
    if(!localThumbnailPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const localVideoPath = req.files?.videoToUpload[0].path;
    if(!localVideoPath){
        throw new ApiError(400,"Video is missing")
    }
    const thumbnail = await fileUploadOnCloudinary(localThumbnailPath);
    if(!thumbnail){
        throw new ApiError(400,"Thumbnail upload failed");
    }
    const uploadedVideo = await fileUploadOnCloudinary(localVideoPath);
    if(!uploadedVideo){
        throw new ApiError(400,"Video upload failed");
    }
    const video = await Video.create({
        videoFile : {
            url : uploadedVideo?.url,
            public_id : uploadedVideo?.public_id
        },
        thumbnail : {
            url : thumbnail?.url,
            public_id : thumbnail?.public_id
        },
        title : title.trim(),
        description : description? description.trim() : "",
        views : 0,
        isPublished : true,
        owner : req.user._id,
        duration : uploadedVideo.duration,

    })

    return res.status(201)
    .json(new ApiResponse(201,video,"Video Successfully Uploaded"));
})
export {
    publishAVideo
};