import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const isVideoLiked = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    });
    if(isVideoLiked){
         await Like.findOneAndDelete({
             video : videoId,
             likedBy : req.user._id
            });
        return res.status(200).json(new ApiResponse(200,{},"unLiked"));
    }else{
        const like = await Like.create({
                video : videoId,
                likedBy : req.user._id
            });
        if(!like){
                    throw new ApiError(500,"Error While liking");
                }
        return res.status(200).json(new ApiResponse(200,like,"Liked"));
    }
    
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment Id");
    }
    const isCommentLiked = await Like.findOne({
        comment : commentId,
        likedBy : req.user._id
    });
    if(isCommentLiked){
         await Like.findOneAndDelete({
             comment : commentId,
             likedBy : req.user._id
            });
        return res.status(200).json(new ApiResponse(200,{},"unLiked"));
    }else{
        const like = await Like.create({
                comment : commentId,
                likedBy : req.user._id
            });
        if(!like){
                    throw new ApiError(500,"Error While liking");
                }
        return res.status(200).json(new ApiResponse(200,like,"Liked"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet Id");
    }
    const isTweetLiked = await Like.findOne({
        tweet : tweetId,
        likedBy : req.user._id
    });
    if(isTweetLiked){
         await Like.findOneAndDelete({
             tweet : tweetId,
             likedBy : req.user._id
            });
        return res.status(200).json(new ApiResponse(200,{},"unLiked"));
    }else{
        const like = await Like.create({
                tweet : tweetId,
                likedBy : req.user._id
            });
        if(!like){
                    throw new ApiError(500,"Error While liking");
                }
        return res.status(200).json(new ApiResponse(200,like,"Liked"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    
    const LikedVideos = await Like.aggregate([
        {
            $match : {
                 likedBy : new mongoose.Types.ObjectId(req.user._id),
                 video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "video",
                pipeline : [
                    {  
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField: "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        username:1,
                                        fullName:1,
                                        avatar : 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]}
            },
            {
                 $addFields : {
                            video : {
                                $first : "$video"
                            }
                }
            }
    ]);
    return res.status(200).json(new ApiResponse(200,LikedVideos,"User Liked Videos Fetched Successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}