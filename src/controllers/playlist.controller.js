import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.model.js"

const getUserPlaylists = asyncHandler(async (req, res) => {
  const user = req.user

  if (!user) {
    throw new ApiError(401, "Not logged in")
  }

  const playlists = await Playlist.find({ owner: user._id })

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "playlists found"))
})

const createPlaylist = asyncHandler(async (req, res) => {
  const user = req.user
  const { name, description } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (!name || !description) {
    throw new ApiError(400, "Name and description required")
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user._id
  })

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist id")
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner")

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const user = req.user
  const { playlistId, videoId } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: user._id
  })

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already added")
  }

  playlist.videos.push(videoId)
  await playlist.save()

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const user = req.user
  const { playlistId, videoId } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: user._id
  })

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  playlist.videos = playlist.videos.filter(
    (v) => v.toString() !== videoId
  )

  await playlist.save()

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video removed"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const user = req.user
  const { playlistId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: user._id
  })

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const user = req.user
  const { playlistId } = req.params
  const { name, description } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: user._id },
    { name, description },
    { new: true }
  )

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated"))
})

export {
  getUserPlaylists,
  createPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
}
