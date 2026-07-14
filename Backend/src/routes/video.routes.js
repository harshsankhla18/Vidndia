import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import  VerifyJWT  from "../middlewares/Auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
const router = Router();
router.route("/upload").post(
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
router.route("/:videoId")
.get(VerifyJWT, getVideoById)
.patch(
    VerifyJWT,
    upload.single("thumbnail"),
    updateVideo
);

router.route("/delete/:videoId").delete(VerifyJWT, deleteVideo);
router.route("/toggle/:videoId").patch(VerifyJWT, togglePublishStatus);
router.route("/").get(getAllVideos);
export default router;