import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
import {fileUploadOnCloudinary} from "../utils/cloudinary.js"
import  ApiResponse  from "../utils/ApiResponse.js";

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

    console.log("Avatar Path:", localAvatarPath);
console.log("Cover Path:", localCoverPath);
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

export { registerUser };

