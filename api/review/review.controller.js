import { logger } from "../../services/logger.service.js"
import { userService } from "../user/user.service.js"
import { authService } from "../auth/auth.service.js"
import { reviewService } from "./review.service.js"
import { toyService } from "../toy/toy.service.js"

export async function getReviews(req, res) {
  try {
    const reviews = await reviewService.query(req.query)
    res.send(reviews)
  } catch (err) {
    logger.error("Cannot get reviews", err)
    res.status(400).send({ err: "Failed to get reviews" })
  }
}

export async function deleteReview(req, res) {
  var { loggedinUser } = req
  const { id: reviewId } = req.params

  try {
    const deletedCount = await reviewService.remove(reviewId)
    if (deletedCount === 1) {
      res.send({ msg: "Deleted successfully" })
    } else {
      res.status(400).send({ err: "Cannot remove review" })
    }
  } catch (err) {
    logger.error("Failed to delete review", err)
    res.status(400).send({ err: "Failed to delete review" })
  }
}

export async function addReview(req, res) {
  var { loggedinUser } = req

  try {
    var review = req.body
    const { toyId } = review
    review.userId = loggedinUser._id
    review = await reviewService.add(review)

    res.send(review)
  } catch (err) {
    logger.error("Failed to add review", err)
    res.status(400).send({ err: "Failed to add review" })
  }
}
