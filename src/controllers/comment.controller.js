import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = "1", limit = "10"} = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if(!Number.isInteger(pageNumber) || pageNumber < 1){
        throw new ApiError(400,"Invalid Page Number");
    }
    if(!Number.isInteger(limitNumber) || limitNumber < 1){
        throw new ApiError(400,"Invalid limit Number");
    }
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    const comments = Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort : {
                "createdAt" : -1
            }
        }
    ]);
    const options = {};
    options.page = pageNumber;
    options.limit = limitNumber;
    const PaginatedComments = await Comment.aggregatePaginate(comments,options);
    return res.status(200).json(new ApiResponse(200,PaginatedComments,"All Comments fetched successfully"));
})

const addComment = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {videoId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }
    if(!content?.trim()){
        throw new ApiError(400,"Content is required");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video does not exists");
    }
    const comment = await Comment.create({
        content : content.trim(),
        video : videoId,
        owner : req.user._id
    });
    if(!comment){
        throw new ApiError(500,"Error while creating comment");
    }
    return res.status(201).json(new ApiResponse(201,comment,"Comment created Successsfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {commentId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
    }
    if(!content?.trim()){
        throw new ApiError(400,"Content is required");
    }
    const comment = await Comment.findById(commentId);
     if(!comment){
        throw new ApiError(404,"Comment does not exists");
    }
    if(!comment.owner.equals(req.user._id)){
         throw new ApiError(403,"Only Owner can update comment");
    }
    comment.content = content.trim();
    await comment.save();
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated Successsfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
   const {commentId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
    }
    const comment = await Comment.findById(commentId);
     if(!comment){
        throw new ApiError(404,"Comment does not exists");
    }
    if(!comment.owner.equals(req.user._id)){
         throw new ApiError(403,"Only Owner can Delete comment");
    }
    await Promise.all([
    Comment.findByIdAndDelete(commentId),
    Like.deleteMany({ comment: commentId })
]);
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted Successsfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }