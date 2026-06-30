import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"
const registerUser = asyncHandler (async (req,res)=>{
    const {username, fullname, email, password} = req.body;
    if ([username, fullname, email, password].some((field)=> field?.trim() === "")) {
        throw new ApiError(400,"All the fields are required !!!")
    }
    
})

export { registerUser };

