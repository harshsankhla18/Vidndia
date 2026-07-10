import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

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
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}