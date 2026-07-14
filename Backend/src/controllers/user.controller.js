import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {deleteFromCloudinary, fileUploadOnCloudinary} from "../utils/cloudinary.js"
import  ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async (user_id) =>{
    try{
        const user = await User.findById(user_id);
        const accessToken = await user.accessTokenGenerator();
        const refreshToken = await user.refreshTokenGenerator();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return {accessToken, refreshToken};

    }catch(error){
        
        throw new ApiError(500,"Something went wrong while generating Tokens");
        
    }

}
const options = {
        httpOnly : true,
        secure : true,
        sameSite: "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000
    }
const registerUser = asyncHandler (async (req,res)=>{
    const {username, fullName, email, password} = req.body;
    if ([username, fullName, email, password].some((field)=> field?.trim() === "")) {
        throw new ApiError(400,"All the fields are required !!!")
    }
    const existedUser = await User.findOne({
        $or: [{username:username?.toLowerCase()},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User Already Exists");
    }
    const localAvatarPath = req.files?.avatar[0].path;
    if(!localAvatarPath){
        throw new ApiError(400,"Avatar is required");
    }
    const Avatar = await fileUploadOnCloudinary(localAvatarPath);
    if(!Avatar){
        throw new ApiError(400,"Avatar Upload Failed");
    }
    
    const localCoverPath = req.files?.coverImage?.[0]?.path;
    const coverImage = (localCoverPath) ? await fileUploadOnCloudinary(localCoverPath) : "";

    const user = await User.create({
        username : username?.toLowerCase(),
        fullName,
        avatar : {
            url:Avatar.url,
            public_id:Avatar.public_id
        },
        coverImage:{
            url: (coverImage) ? coverImage.url : "",
            public_id: (coverImage) ? coverImage.public_id : ""
        },
        email,
        password
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError("500","Failed to register User")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(createdUser._id);
    const loggedUser = await User.findById(createdUser._id).select("-password -refreshToken");
    
    return res.status(201)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            201,
            {
                user : loggedUser,
                accessToken,
            },
            "User Created and LoggedIn successfully"
    )
    );
    
})
const loginUser = asyncHandler(async (req,res) =>{
    const {identifier,password} = req.body;
    const username = identifier;
    const email = identifier;
    if(!username && !email){
        throw new ApiError(400,"Username or email is required");
    }
    if(!password){
        throw new ApiError(400,"PassWord is required")
    }
    const validUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(!validUser){
        throw new ApiError(404,"This user is not registered");
    }
    const validPassword = await validUser.isPasswordUpdated(password);
    if(!validPassword){
        throw new ApiError(401,"Wrong Password");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(validUser._id);
    const loggedUser = await User.findById(validUser._id).select("-password -refreshToken");
    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedUser,
                accessToken,
            },
            "User LoggedIn successfully"
    )
    );
})
const logoutUser = asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken: null
        }
    },
    {
        new: true
    }
)
    return res.status(200)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"));
})
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized Access");
    }
   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
    }
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(400,"Refresh Token Expired")
    }
 
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    return res.status(200)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
     accessToken
    },
    "Refreshed Successfully"
 ));
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
   }

})
const getCurrentUser = asyncHandler(async (req,res) => {
    return res.status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetched "))
})
const changePassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user._id).select("-refreshToken");
    const isPasswordCorrect = await user.isPasswordUpdated(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Password Incorrect");
    }
    if(oldPassword == newPassword){
        throw new ApiError(400,"New Password should be different from old Password")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave : false});
    return res.status(200).json(new ApiResponse(200,{},"Password Updated Successfully"))
})
const updateDetails = asyncHandler(async (req,res) => {
    const {fullName, email} = req.body;
    const updatefields = {};
    if(fullName?.trim()) updatefields.fullName=fullName;
    if(email?.trim()) updatefields.email=email;
    if(Object.keys(updatefields).length === 0){
        throw new ApiError(400,"No Content Provided to Update")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
           $set:updatefields
        },
   {new:true}
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200,user,"User Details Updated Successfully"));
    
})
const updateAvatar = asyncHandler(async (req,res) => {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is missing");
    }
    const avatar=await fileUploadOnCloudinary(avatarLocalPath);
    if(!avatar?.url){
         throw new ApiError(400,"Error While Uploading on Avatar");
    }
    const oldAvatar = req.user?.avatar?.public_id;
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                avatar :{
                    url : avatar.url,
                    public_id : avatar.public_id,
                } 

            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    if(oldAvatar) await deleteFromCloudinary(oldAvatar);
    return res.status(200)
    .json(new ApiResponse(200,user,"Avatar Updated Successfully"));
})
const updateCoverImage = asyncHandler(async (req,res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400,"CoverImage File is missing");
    }
    const coverImage=await fileUploadOnCloudinary(coverImageLocalPath);
    if(!coverImage?.url){
         throw new ApiError(400,"Error While Uploading on CoverImage");
    }
    const oldCoverImage = req.user?.coverImage?.public_id;
    
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set : {
                coverImage :{
                    url: coverImage.url,
                    public_id:coverImage.public_id
                }
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
   if(oldCoverImage) await deleteFromCloudinary(oldCoverImage);
    return res.status(200)
    .json(new ApiResponse(200,user,"CoverImage Updated Successfully"));
})
const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;
    if(!username?.trim()){
        throw new ApiError(400,"Username is required");
    }
    const user = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },{
            $lookup : {
                from : "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                "subscribersCount" : {
                    $size : "$subscribers"
                },
                "subscribedToCount" : {
                    $size : "$subscribedTo"
                },
                "isSubscribed" : {
                    
                      $in : [new mongoose.Types.ObjectId(req.user?._id),"$subscribers.subscriber"]
                    }
                }
            
        },
        {
            $project : {
                username : 1,
                fullName : 1,
                email : 1,
                _id:0,
                createdAt : 1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                subscribedToCount:1,
                isSubscribed:1
            }
        }

    ]);
    if(!user?.length){
        throw new ApiError(404,"Channel Not Found")
    }
    const channel = user[0];
    return res.status(200).json(new ApiResponse(200,channel,"User Fetched Successfully"));
})
const getWatchHistory = asyncHandler(async (req,res) => {
    if(!req.user){
        throw new ApiError(400,"User is required");
    }
    const user = await User.aggregate([
        {
            $match : {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
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
                                owner :{
                                    $first : "$owner"
                                }
                            }
                    }
                ]

            }
        }
       
    ]);
   return res.status(200)
   .json(new ApiResponse(200,user[0]?.watchHistory,"Fetched History Successfully"));


})
const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: {
                watchHistory: videoId
            }
        }
    );

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $push: {
                watchHistory: {
                    $each: [videoId],
                    $position: 0
                }
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video added to watch history"
        )
    );
});
export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getCurrentUser, 
    changePassword,
    updateDetails, 
    updateAvatar, 
    updateCoverImage, 
    getUserChannelProfile, 
    getWatchHistory,
    addToWatchHistory
 };

