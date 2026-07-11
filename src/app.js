import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import userrouter from "./routes/user.routes.js";
app.use("/api/v1/users",userrouter);

import videorouter from "./routes/video.routes.js";
app.use("/api/v1/",videorouter);

import tweetrouter from "./routes/tweet.routes.js";
app.use("/api/v1/tweet",tweetrouter);

import subscriptionrouter from "./routes/subscription.routes.js";
app.use("/api/v1/subscription",subscriptionrouter);

import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes", likeRouter);

export { app };