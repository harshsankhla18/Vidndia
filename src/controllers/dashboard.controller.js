import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid Channel Id");
    }
    const channelCheck = await User.findById(channelId);
    if(!channelCheck){
        throw new ApiError(404,"Channel does not exists");
    }
    const [
    views,
    subscribers,
    subscribed,
    videoLikes,
    tweetLikes
] = await Promise.all([
    Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : "$owner",
                totalViews : { $sum : "$views"},
                totalVideos: { $count: {} }
            }
        }
    ]),

    Subscription.aggregate([
        {
             $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : "$channel",
                totalSubscribers : { $count : {}}
            }
        }
    ]),

     Subscription.aggregate([
        {
             $match : {
                subscriber : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : "$subscriber",
                totalSubscribed : { $count : {}}
            }
        }
    ]),

    Like.aggregate([
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "video",
                pipeline : [{
                    $project : {
                        owner : 1
                    }
                }]
            },
        },
        {
          $addFields : {
            owner :{
                    $first : "$video.owner"
                   }
          }  
        },
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : "$owner",
                likes : { $count : {}}
            }
        }
    ]),

    Like.aggregate([
        {
            $lookup : {
                from : "tweets",
                localField : "tweet",
                foreignField : "_id",
                as : "tweet",
                pipeline : [{
                    $project : {
                        owner : 1
                    }
                }]
            },
        },
        {
          $addFields : {
            owner :{
                    $first : "$tweet.owner"
                   }
          }  
        },
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : "$owner",
                likes : { $count : {}}
            }
        }
    ])
]);
const output = {
    totalViews : views[0]?.totalViews || 0,
    subscribers : subscribers[0]?.totalSubscribers || 0,
    subscribed : subscribed[0]?.totalSubscribed || 0,
    videoLikes : videoLikes[0]?.likes || 0,
    tweetLikes : tweetLikes[0]?.likes || 0,
    totalVideos: views[0]?.totalVideos || 0
};
     return res.status(200).json(new ApiResponse(200,output,"Fetched User stats"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
    const videos = await Video.find({
            owner: channelId
        }).select("_id");
    return res.status(200).json(new ApiResponse(200,videos,"Videos List Fetched"));
})

export {
    getChannelStats, 
    getChannelVideos
    }