import {Router} from 'express'
import { getAllVideos, uploadVideo ,getVideoById,updateVideo,deleteVideo,togglePublishStatus} from '../controllers/video.controller.js'
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJwt }  from '../middlewares/auth.middleware.js'
const router  = Router()


router.route("/getvideos").get(getAllVideos)
router.route("/getvideobyid/:id").get(getVideoById)

//secured routes

router.route("/uploadvideo").post(verifyJwt,
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    uploadVideo)


router.route("/updatevideo/:videoId").patch(verifyJwt, upload.fields([
    {
        name:"thumbnail",
        maxCount:1
    }
]), updateVideo)

router.route("/deletevideo/:videoId").delete(verifyJwt, deleteVideo)
router.route("/toggle-status/:videoId").patch(verifyJwt, togglePublishStatus)

    export default router