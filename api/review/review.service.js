import { ObjectId } from "mongodb"

import { logger } from "../../services/logger.service.js"
import { asyncLocalStorage } from "../../services/als.service.js"
import { dbService } from "../../services/db.service.js"

export const reviewService = {
  query,
  remove,
  add,
}

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("review")

    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: "userId",
            from: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $lookup: {
            localField: "toyId",
            from: "toy",
            foreignField: "_id",
            as: "toy",
          },
        },
        {
          $unwind: "$toy",
        },
        {
          $project: {
            txt: true,
            "user._id": true,
            "user.fullname": true,
            "toy._id": true,
            "toy.name": true,
            "toy.price": true,
          },
        },
      ])
      .toArray()
    return reviews
  } catch (err) {
    logger.error("Cannot get reviews", err)
    throw err
  }
}
async function remove(reviewId) {
  try {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const collection = await dbService.getCollection("review")

    const criteria = { _id: ObjectId.createFromHexString(reviewId) }

    if (!loggedinUser.isAdmin) {
      criteria.userId = ObjectId.createFromHexString(loggedinUser._id)
    }

    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error("Cannot remove review", err)
    throw err
  }
}
async function add(review) {
  try {
    const reviewToAdd = {
      txt: review.txt,
      userId: ObjectId.createFromHexString(review.userId),
      toyId: ObjectId.createFromHexString(review.toyId),
    }
    const collection = await dbService.getCollection("review")
    await collection.insertOne(reviewToAdd)

    return reviewToAdd
  } catch (err) {
    logger.error("Cannot add review", err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}

  if (filterBy.userId) {
    criteria.userId = ObjectId.createFromHexString(filterBy.userId)
  }
  if (filterBy.toyId) {
    criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
  }
  return criteria
}
