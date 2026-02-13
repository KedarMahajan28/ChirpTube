import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import {
  togglevideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
} from "../controllers/like.controller.js"

const router = Router()

router.route("/video/:videoId")
  .patch(verifyJwt, togglevideoLike)

router.route("/comment/:commentId")
  .patch(verifyJwt, toggleCommentLike)

router.route("/tweet/:tweetId")
  .patch(verifyJwt, toggleTweetLike)

router.route("/videos")
  .get(verifyJwt, getLikedVideos)

export default router
