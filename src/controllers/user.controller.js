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
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    const isPasswordCorrect = await user.isPasswordUpdated(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400,"Password Incorrect");
    }
    if(oldPassword == newPassword){
        throw new ApiError(400,"New Password should be different from old Password")
    }
    user.password=newPassword;
    user.save({validateBeforeSave : false});
    return res.status(200).json(200,{},"Password Updated Successfully")
})
const updateDetails = asyncHandler(async (req,res) => {
    const {fullName, email, username} = req.body;
    if(!fullName && !email && !username){
        throw new ApiError(400,"No content provided for update")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            fullname,
            email,
            username
        },
   {new:true}
    ).select("-password -refreshToken");
    
    return res.status(200).json(new ApiResponse(200,{},"User Details Updated Successfully"));
    
})
export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser };

