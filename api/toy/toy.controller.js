import { logger } from "../../services/logger.service.js"
import { toyService } from "./toy.service.js"

export async function getToys(req, res) {
  const queryOptions = parseQueryParams(req.query)

  console.log(queryOptions)
  try {
    const toys = await toyService.query(queryOptions)
    return res.json(toys)
  } catch (err) {
    logger.error(err)
    res.status(404).send("Can't get toys")
  }
}

export async function getToyById(req, res) {
  const toyId = req.params.id
  try {
    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    logger.error(err)
    res.status(404).send("Can't find toy")
  }
}

export async function saveToy(req, res) {
  const toy = { ...req.body, _id: req.params.id }
  try {
    const savedToy = await toyService.save(toy)
    return res.json(savedToy)
  } catch (err) {
    logger.error(err)
    res.status(404).send("Can't save toy")
  }
}

export async function removeToy(req, res) {
  const toyId = req.params.id
  try {
    const deletedCount = await toyService.remove(toyId)
    res.send("Toy removed!")
  } catch (err) {
    logger.error(err)
    res.status(404).send("Can't find toy to remove")
  }
}

export async function addToyMsg(req, res) {
  const { loggedinUser } = req
  const toyId = req.params.id
  try {
    const msg = {
      txt: req.body.txt,
      by: loggedinUser,
      createdAt: Date.now(),
    }
    const savedMsg = await toyService.addToyMsg(toyId, msg)

    res.json(savedMsg)
  } catch (err) {
    logger.error("Failed to update toy msg", err)
    res.status(404).send({ err: "Failed to update toy msg" })
  }
}

export async function removeToyMsg(req, res) {
  const { loggedinUser } = req
  const { id: toyId, msgId } = req.params
  try {
    const removedId = await toyService.removeToyMsg(toyId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error("Failed to remove toy msg", err)
    res.status(404).send({ err: "Failed to remove toy msg" })
  }
}

function parseQueryParams(queryParams) {
  const filterBy = {
    txt: queryParams.txt || "",
    inStock: +queryParams.inStock || "",
    labels: queryParams.labels || [],
  }
  const sortBy = {
    sortField: queryParams.sortField || "",
    sortDir: +queryParams.sortDir || 1,
  }

  return { filterBy, sortBy }
}
