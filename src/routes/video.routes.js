import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { VerifyJWT } from "../middlewares/Auth.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";
const router = Router();
router.route("/video-upload").post(
     VerifyJWT ,
    upload.fields([
        {
           name : "videoToUpload",
           maxCount : 1 
        },
        {
           name : "thumbnailToUpload",
           maxCount : 1 
        }
    ]), publishAVideo
)