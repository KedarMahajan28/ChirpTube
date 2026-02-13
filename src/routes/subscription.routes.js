import { Router } from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import {
  toggleSubscription,
  getUserSubscriptions,
  getChannelSubscribers
} from "../controllers/subscriptions.controller.js"

const router = Router()

router.route("/me")
  .get(verifyJwt, getUserSubscriptions)

router.route("/channel/:channelId")
  .get(getChannelSubscribers)

router.route("/:channelId")
  .patch(verifyJwt, toggleSubscription)

export default router
