
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Tweet } from "../models/tweet.model.js"

const createTweet = asyncHandler(async (req, res) => {
  const user = req.user
  const { content } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const tweet = await Tweet.create({
    content,
    owner: user._id
  })

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
  const user = req.user

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const tweets = await Tweet.find({ owner: user._id })
    .sort({ createdAt: -1 })

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
  const user = req.user
  const { tweetId } = req.params
  const { content } = req.body

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: user._id },
    { content },
    { new: true }
  )

  if (!tweet) {
    throw new ApiError(404, "Tweet not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
  const user = req.user
  const { tweetId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: user._id
  })

  if (!tweet) {
    throw new ApiError(404, "Tweet not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted"))
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}
