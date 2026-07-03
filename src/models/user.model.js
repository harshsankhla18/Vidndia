import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
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
      url: { 
        type: String, 
        required:true
    },
    public_id:{
         type: String, 
        required:true
    }
    },
    coverImage:{
        url : {
            type: String, 
        },
        public_id:{
            type:String
        }
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
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
    if(!this.isModified("password")) return next;
    this.password= await bcrypt.hash(this.password,7);
     next;
})
userSchema.methods.isPasswordUpdated= async function(passWord){
     return await bcrypt.compare(passWord,this.password) ;
}
userSchema.methods.accessTokenGenerator=  function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
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
export const User = mongoose.model('User', userSchema);