import {Router} from 'express'
import { loginUser,logoutUser,registerUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountdetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory,} from '../controllers/user.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt }  from '../middlewares/auth.middleware.js'
const router  = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJwt,logoutUser)
routeer.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/me").get(verifyJwt,getCurrentUser)
router.route("/update-account").patch(verifyJwt,updateAccountdetails)
router.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)

router.route("/update-coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)

router.route("/c/:channel").get(verifyJwt,getUserChannelProfile)

router.route("/history").get(verifyJwt,getWatchHistory)

export default router