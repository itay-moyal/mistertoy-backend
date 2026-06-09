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
            localField: "byUserId",
            from: "user",
            foreignField: "_id",
            as: "byUser",
          },
        },
        {
          $unwind: "$byUser",
        },
        {
          $lookup: {
            localField: "aboutToyId",
            from: "toy",
            foreignField: "_id",
            as: "aboutToy",
          },
        },
        {
          $unwind: "$aboutToy",
        },
        {
          $project: {
            txt: true,
            "byUser._id": true,
            "byUser.fullname": true,
            "aboutToy._id": true,
            "aboutToy.name": true,
            "aboutToy.price": true,
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
      criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
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
      byUserId: ObjectId.createFromHexString(review.byUserId),
      aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
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

  if (filterBy.byUserId) {
    criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
  }

  if (filterBy.aboutToyId) {
    criteria.aboutToyId = ObjectId.createFromHexString(filterBy.aboutToyId)
  }
  return criteria
}
