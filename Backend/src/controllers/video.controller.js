import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, fileUploadOnCloudinary, largeFileUploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if(!title?.trim()){
        throw new ApiError(400,"Video Title cannot be empty");
    }
    const localThumbnailPath = req.files?.thumbnail?.[0]?.path;
    if(!localThumbnailPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const localVideoPath = req.files?.video?.[0]?.path;
    if(!localVideoPath){
        throw new ApiError(400,"Video is missing")
    }
    const thumbnail = await fileUploadOnCloudinary(localThumbnailPath);
    if(!thumbnail){
        throw new ApiError(500,"Thumbnail upload failed");
    }
    const uploadedVideo = await largeFileUploadOnCloudinary(localVideoPath);
    if(!uploadedVideo){
        throw new ApiError(500,"Video upload failed");
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
});
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    },
{
    new:true
});
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    return res.status(200).json(new ApiResponse(200,video,"Video Found"));
});
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
     if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403,"Access Denied");
    }
    const {title ,description} = req.body;
    const updatefields = {};
    if(title?.trim()){
        updatefields.title = title.trim();
    }
    
    if(description?.trim()){
        updatefields.description = description.trim();
    }
    
    const thumbnailLocalPath = req.file?.path;
    const oldThumbnail = video.thumbnail?.public_id;
    if(thumbnailLocalPath){
       const thumbnail = await fileUploadOnCloudinary(thumbnailLocalPath);
       if(!thumbnail){
            throw new ApiError(500,"Failed to upload thumbnail on cloudinary");
       }
       updatefields.thumbnail = {
        url : thumbnail.url,
        public_id : thumbnail.public_id
       }
    }
    if(Object.keys(updatefields).length === 0){
        throw new ApiError(400,"No Content to update");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
    {
        $set : updatefields
    },
    {
        new : true
    }
    )
    if(!updatedVideo){
        throw new ApiError(500,"Failed to update video");
    }
    if(thumbnailLocalPath){
        await deleteFromCloudinary(oldThumbnail);
    }
    return res.status(200).json(new ApiResponse(200,updatedVideo,"Video Updated Successfully"))
});
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(!video?.owner.equals(req.user._id)){
        throw new ApiError(403,"Access Denied");
    }
    await deleteFromCloudinary(video.videoFile.public_id);
    await deleteFromCloudinary(video.thumbnail.public_id);
    await Promise.all([
    Like.deleteMany({ video: videoId }),
    Comment.deleteMany({ video: videoId }),
    Playlist.updateMany(
        {
            videos : videoId
        },
        {
            $pull : {
                videos : videoId
            }
        }
    ),
    User.updateMany(
    {
        watchHistory : videoId
    },
    {
        $pull : {
            watchHistory : videoId
        }
    }
)   
     ]);
     await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(200,{},"Video Successfully Deleted"))
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "Access Denied");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(new ApiResponse(200,"Video publish status toggled successfully"))

});
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = "1", limit = "10", query, sortBy, sortType, userId } = req.query
     if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new ApiError(400, "Page must be a natural number");
    }
    if (!Number.isInteger(limitNumber) || limitNumber <= 1 || limitNumber >= 100) {
    throw new ApiError(400, "Limit must be between 1 and 100");
    }
    const match = {
            isPublished: true
        };

        if (userId) {
            match.owner = new mongoose.Types.ObjectId(userId);
        }

        if (query) {
            match.$or = [
                {
                    title: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ];
        }
    const aggregatedVideo = Video.aggregate([
        {
            $match : match
        },
        {
            $sort : {
                [sortBy || "views"] : sortType === "asc" ? 1 : -1,
                "createdAt" : -1,
            }
        }
    ]);
    const video = await Video.aggregatePaginate(
        aggregatedVideo,
         {
        page : pageNumber, limit : limitNumber
    }
    );
    return res.status(200).json(new ApiResponse(200,video,"All videos fetched successfully"));
});
export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
};