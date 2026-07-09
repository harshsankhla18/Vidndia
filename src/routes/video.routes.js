import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { VerifyJWT } from "../middlewares/Auth.middleware.js";
import { getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";
const router = Router();
router.route("/video-upload").post(
     VerifyJWT ,
    upload.fields([
        {
           name : "video",
           maxCount : 1 
        },
        {
           name : "thumbnail",
           maxCount : 1 
        }
    ]), publishAVideo
);
router.route("/video/:videoId")
.get(getVideoById)
.patch(
    VerifyJWT,
    upload.single("thumbnail"),
    updateVideo
);