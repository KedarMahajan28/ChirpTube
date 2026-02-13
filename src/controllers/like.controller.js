import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"

const togglevideoLike = asyncHandler(async (req, res) => {
  const user = req.user
  const { videoId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const like = await Like.findOne({
    video: videoId,
    likedBy: user._id
  })

  if (like) {
    await like.deleteOne()
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked"))
  }

  await Like.create({
    video: videoId,
    likedBy: user._id
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const user = req.user
  const { commentId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const like = await Like.findOne({
    comment: commentId,
    likedBy: user._id
  })

  if (like) {
    await like.deleteOne()
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked"))
  }

  await Like.create({
    comment: commentId,
    likedBy: user._id
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const user = req.user
  const { tweetId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: user._id
  })

  if (like) {
    await like.deleteOne()
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet unliked"))
  }

  await Like.create({
    tweet: tweetId,
    likedBy: user._id
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet liked"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const likes = await Like.find({
    likedBy: user._id,
    video: { $ne: null }
  }).populate("video")

  const videos = likes.map(like => like.video)

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "liked videos fetched"))
})

export {
  togglevideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}
