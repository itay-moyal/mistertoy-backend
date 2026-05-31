import { ObjectId } from "mongodb"

import { dbService } from "../../services/db.service.js"
import { logger } from "../../services/logger.service.js"
import { makeId } from "../../services/util.service.js"
import { log } from "../../middlewares/logger.middleware.js"

export const toyService = {
  query,
  getById,
  save,
  remove,
  addToyMsg,
  removeToyMsg,
}

async function query(queryOptions = {}) {
  const criteria = _buildCriteria(queryOptions)
  try {
    const collection = await dbService.getCollection("toy")
    var toys = await collection.find(criteria).toArray()

    toys = toys.map((toy) => {
      toy.createdAt = toy._id.getTimestamp()
      return toy
    })
    return toys
  } catch (err) {
    logger.error("cannot find toys", err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection("toy")
    let toy = await collection.findOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    var toys = await collection.find().toArray()
    toy.createdAt = toy._id.getTimestamp()
    toy = _setNextPrevToyId(toy, toys)
    return toy
  } catch (err) {
    logger.error(`error while finding toy`, err)
    throw err
  }
}

async function save(toyToSave) {
  if (toyToSave._id) {
    const { _id, ...toyToUpdate } = toyToSave
    try {
      const collection = await dbService.getCollection("toy")
      await collection.updateOne(
        { _id: ObjectId.createFromHexString(toyToSave._id) },
        { $set: toyToUpdate },
      )
      return toyToSave
    } catch (err) {
      logger.error(`cannot update toy`, err)
      throw err
    }
  } else {
    try {
      toyToSave.imgUrl = `https://robohash.org/${toyToSave.name}?set=set2`
      const collection = await dbService.getCollection("toy")
      await collection.insertOne(toyToSave)

      return toyToSave
    } catch (err) {
      logger.error("cannot insert toy", err)
      throw err
    }
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection("toy")
    const { deletedCount } = await collection.deleteOne({
      _id: ObjectId.createFromHexString(toyId),
    })
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove toy`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = makeId()
    const collection = await dbService.getCollection("toy")
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toyId) },
      { $push: { msgs: msg } },
    )
    return msg
  } catch (err) {
    logger.error("cannot add toy msg", err)
    throw err
  }
}
async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection("toy")
    await collection.updateOne(
      { _id: ObjectId.createFromHexString(toyId) },
      { $pull: { msgs: { id: msgId } } },
    )
    return msgId
  } catch (err) {
    logger.error("cannot remove toy msg ", err)
    throw err
  }
}

function _buildCriteria(queryOptions) {
  const { filterBy, sortBy } = queryOptions
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" }
    criteria.name = txtCriteria
  }
  if (filterBy.labels && filterBy.labels.length > 0) {
    criteria.labels = { $in: filterBy.labels }
  }
  if (filterBy.inStock) {
    criteria.inStock = JSON.parse(filterBy.inStock)
  }
  if (filterBy.minPrice) {
    criteria.price = criteria.price || {}
    criteria.price.$gte = +filterBy.minPrice
  }
  if (filterBy.maxPrice) {
    criteria.price = criteria.price || {}
    criteria.price.$lte = +filterBy.maxPrice
  }
  return criteria
}

function _setNextPrevToyId(toy, toys) {
  const toyIdx = toys.findIndex((currToy) => currToy._id.equals(toy._id))
  const nextToy = toys[toyIdx + 1] ? toys[toyIdx + 1] : toys[0]
  const prevToy = toys[toyIdx - 1] ? toys[toyIdx - 1] : toys[toys.length - 1]
  toy.nextToyId = nextToy._id
  toy.prevToyId = prevToy._id
  return toy
}
