import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js"

const router = Router()

router.route("/myplaylists")
  .get(verifyJwt, getUserPlaylists)

router.route("/create")
  .post(verifyJwt, createPlaylist)

router.route("/add-video")
  .patch(verifyJwt, addVideoToPlaylist)

router.route("/remove-video")
  .patch(verifyJwt, removeVideoFromPlaylist)

router.route("/:playlistId")
  .get(verifyJwt, getPlaylistById)
  .patch(verifyJwt, updatePlaylist)
  .delete(verifyJwt, deletePlaylist)

export default router
