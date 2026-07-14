import { Router } from "express";
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import  VerifyJWT  from "../middlewares/Auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields(
        [
            {
                name : "avatar",
                maxCount:1
            },
            {
                name : "coverImage",
                maxCount:1
            }
        ]
    )
    ,
    registerUser)

router.route("/login").post(loginUser);
router.route("/logout").post(VerifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(VerifyJWT, changePassword);
router.route("/current-user").get(VerifyJWT, getCurrentUser);
router.route("/update-account-details").patch(VerifyJWT, updateDetails);
router.route("/update-avatar").patch(VerifyJWT,upload.single("avatar"),updateAvatar);
router.route("/update-coverImage").patch(VerifyJWT,upload.single("coverImage"),updateCoverImage);
router.route("/c/:username").get(VerifyJWT,getUserChannelProfile);
router.route("/history").get(VerifyJWT,getWatchHistory);
export default router;