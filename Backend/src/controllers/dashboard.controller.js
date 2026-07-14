import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    const [
        views,
        subscribers,
        subscribed,
        videoLikes,
        tweetLikes
    ] = await Promise.all([
        Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: "$owner",
                    totalViews: { $sum: "$views" },
                    totalVideos: { $sum: 1 }
                }
            }
        ]),

        Subscription.countDocuments({
            channel: channelId
        }),

        Subscription.countDocuments({
            subscriber: channelId
        }),

        Like.aggregate([
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video"
                }
            },
            {
                $unwind: "$video"
            },
            {
                $match: {
                    "video.owner":
                        new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "likes"
            }
        ]),

        Like.aggregate([
            {
                $lookup: {
                    from: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweet"
                }
            },
            {
                $unwind: "$tweet"
            },
            {
                $match: {
                    "tweet.owner":
                        new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "likes"
            }
        ])
    ])

    const output = {
        totalViews: views[0]?.totalViews || 0,
        totalVideos: views[0]?.totalVideos || 0,
        subscribers,
        subscribed,
        videoLikes: videoLikes[0]?.likes || 0,
        tweetLikes: tweetLikes[0]?.likes || 0
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            output,
            "Fetched channel stats"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    const videos = await Video.find({
        owner: channelId
    })
        .select(
            "title thumbnail views isPublished createdAt"
        )
        .sort({
            createdAt: -1
        })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos list fetched"
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}