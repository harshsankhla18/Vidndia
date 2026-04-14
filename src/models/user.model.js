import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
// import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username:{
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'UserName should be unique'],
        lowercase: true,
        trim:true,
        index:true
    },
    email:{
        type: String,
        required: [true, 'E-mail is required'],
        unique: [true, 'E-mail should be unique'],
        lowercase: true,
        trim:true,
    },
    fullName:{
        type: String,
        required: [true, 'Full Name is required'],
        trim:true,
        index:true
    },
    avatar:{
        type: String, //cloudinary url
        required:true
    },
    overImage:{
        type: String, //cloudinary url
    },
    watchHistory:[{
        type: Schema.types.objectID,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,'Passwrod is required']
    },
    refreshToken:{
        type:String
    }
},{
    timestamps:true
});
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,7);
     next();
})
userSchema.methods.isPasswordUpdated= async function(passw){
     return await bcrypt.compare(passw,this.password) ;
}
userSchema.methods.accessTokenGenerator=  function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
 process.env.ACCESS_TOKEN_SECRET,
 {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
 }

)
}
userSchema.methods.refreshTokenGenerator=  function(){
    return jwt.sign({
        _id:this._id,
    },
 process.env.REFRESH_TOKEN_SECRET,
 {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
 }

)
}
export const User = mongoose.model('User', UserSchema);