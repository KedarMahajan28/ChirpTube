import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
} from "../controllers/comment.controller.js"

const router = Router()

router.route("/video/:videoId")
  .get(getVideoComments)
  .post(verifyJwt, addComment)

router.route("/:commentId")
  .patch(verifyJwt, updateComment)
  .delete(verifyJwt, deleteComment)

export default router
