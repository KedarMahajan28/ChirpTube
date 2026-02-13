import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id")
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner")
    .sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comments fetched"))
})

const addComment = asyncHandler(async (req, res) => {
  const user = req.user
  const { videoId } = req.params
  const { content } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: user._id
  })

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
  const user = req.user
  const { commentId } = req.params
  const { content } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: user._id },
    { content },
    { new: true }
  )

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
  const user = req.user
  const { commentId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: user._id
  })

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted"))
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}
