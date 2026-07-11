import mongoose, { isValidObjectId, Promise } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    if(!content?.trim()){
        throw new ApiError(400,"Content is Missing");
    }
    const tweet = await Tweet.create({
        content : content.trim(),
        owner : req.user._id
    });
    return res.status(201).json(new ApiResponse(200,tweet,"Tweet Created Successfully"))
});

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid User");
    }
    const userTweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,userTweets,"Fetched all user tweets"));
});

const updateTweet = asyncHandler(async (req, res) => {
   const { tweetId } = req.params;
   const { newContent } = req.body;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }
    if(!newContent?.trim()){
        throw new ApiError(400,"Tweet cannot be empty");
    }
    const tweet  = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403, "Only the tweet owner can edit this tweet");
    }
    if (tweet.content === newContent?.trim()){
        throw new ApiError(400,"Tweet cannot be same as old Tweet");
    }
    tweet.content = newContent.trim();
    await tweet.save();
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
     const { tweetId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }
    const tweet = await Tweet.findById(tweetId);
        if(!tweet){
            throw new ApiError(404,"Tweet not found");
        }
        if(!tweet?.owner.equals(req.user._id)){
            throw new ApiError(403,"Access Denied");
        }
        await Promise.all(
            [
                Tweet.findByIdAndDelete(tweetId),
                Like.deleteMany({"tweet" : tweetId})
            ]
        );
    
    return res.status(200).json(new ApiResponse(200,{},"Tweet Deleted Successfully"))
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}