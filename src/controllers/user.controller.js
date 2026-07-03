import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {fileUploadOnCloudinary} from "../utils/cloudinary.js"
import  ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
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
    
    const localCoverPath = req.files?.coverImage[0].path;
    const coverImage =await fileUploadOnCloudinary(localCoverPath);

    const user = await User.create({
        username : username?.toLowerCase(),
        fullName,
        avatar : Avatar.url,
        coverImage: (coverImage) ? coverImage.url : "",
        email,
        password
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError("500","Failed to register User")
    }
    
    return res.status(201).json(new ApiResponse(200,createdUser,"User Created Successfully"));
    
})
const loginUser = asyncHandler(async (req,res) =>{
    const {username,email,password} = req.body;
    if(!username && !email){
        throw new ApiError(400,"Username and email is required");
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
    const options = {
        httpOnly : true,
        secure : true,
        sameSite: "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000
    }
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
const options = {
        httpOnly : true,
        secure : true,
        sameSite: "strict",
    }
    return res.status(200)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"));
})
const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(4001,"Unauthorized Access");
    }
   try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    const user=await User.findById(decodedToken._id);
    
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(400,"Refresh Token Expired")
    }
 
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const options = {
        httpOnly : true,
        secure : true,
        sameSite: "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000
    }
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
export { registerUser, loginUser, logoutUser, refreshAccessToken };

