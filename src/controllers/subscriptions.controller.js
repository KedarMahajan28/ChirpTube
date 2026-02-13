import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Subscription } from "../models/subscription.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
  const user = req.user
  const { channelId } = req.params

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  if (user._id.toString() === channelId) {
    throw new ApiError(400, "Cannot subscribe to yourself")
  }

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id")
  }

  const sub = await Subscription.findOne({
    Subscriber: user._id,
    channel: channelId
  })

  if (sub) {
    await sub.deleteOne()
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unsubscribed"))
  }

  await Subscription.create({
    Subscriber: user._id,
    channel: channelId
  })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "subscribed"))
})

const getUserSubscriptions = asyncHandler(async (req, res) => {
  const user = req.user

  if (!user) {
    throw new ApiError(401, "Not authorized")
  }

  const subs = await Subscription.find({
    Subscriber: user._id
  }).populate("channel")

  const channels = subs.map(s => s.channel)

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "subscriptions fetched"))
})

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel id")
  }

  const subs = await Subscription.find({
    channel: channelId
  }).populate("Subscriber")

  const users = subs.map(s => s.Subscriber)

  return res
    .status(200)
    .json(new ApiResponse(200, users, "subscribers fetched"))
})

export {
  toggleSubscription,
  getUserSubscriptions,
  getChannelSubscribers
}
