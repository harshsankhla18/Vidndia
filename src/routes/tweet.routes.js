import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import  VerifyJWT  from "../middlewares/Auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
const router = Router();
router.route("/create").post(VerifyJWT, createTweet);
router.route("/user/:userId").get(VerifyJWT, getUserTweets);
router.route("/update/:tweetId").patch( VerifyJWT, updateTweet);
router.route("/delete/:tweetId").delete(VerifyJWT, deleteTweet);
export default router;