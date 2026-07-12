import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid Channel");
    }
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel Not Found");
    }
    const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id
    });
    if(subscription){
        await Subscription.findOneAndDelete({
            channel: channelId,
            subscriber: req.user._id
            });
            return res.status(200).json(new ApiResponse(200,{},"Unsubscribed"));
    }else{
        const subs = await Subscription.create({
            channel : channelId,
            subscriber:req.user._id
        });
        if(!subs){
            throw new ApiError(500,"Error While subscribing");
        }
        return res.status(200).json(new ApiResponse(200,subs,"Subscribed"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404,"Channel Not Found");
    }
    const UserChannel = await Subscription.aggregate([
        {
            $match : {
                "channel" : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $project : {
                subscriber : 1
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,UserChannel,"User Channel Subscribers Fetched Successfully"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400,"Invalid subscriber Id");
    }
    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(404,"Subscriber Not Found");
    }
    const SubscribedChannels = await Subscription.aggregate([
        {
            $match : {
                "subscriber" : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $project : {
                channel : 1
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,SubscribedChannels,"User Subscribed Channel Fetched Successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}