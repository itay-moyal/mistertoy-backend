import fs from "fs"
import { writeJsonFile, readJsonFile, makeId } from "./util.service.js"
import { log } from "console"
const toys = readJsonFile("data/toy.json")
const PATH = "data/toy.json"
export const toyService = {
  query,
  getById,
  save,
  remove,
}
// console.log("toys", toys)

async function query(queryOptions = {}) {
  const { filterBy, sortBy } = queryOptions
  // console.log("queryOptions", queryOptions)
  if (!filterBy) return toys

  let filteredToys = toys

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, "i")
    filteredToys = filteredToys.filter((toy) => regExp.test(toy.name))
  }
  if (filterBy.labels && filterBy.labels.length > 0) {
    filteredToys = filteredToys.filter((toy) => {
      return toy.labels.some((label) => filterBy.labels.includes(label))
    })
  }
  if (filterBy.inStock) {
    filteredToys = filteredToys.filter((toy) => {
      return toy.inStock === JSON.parse(filterBy.inStock)
    })
  }
  filterBy.maxPrice = +filterBy.maxPrice ? +filterBy.maxPrice : Infinity
  filterBy.minPrice = +filterBy.minPrice ? +filterBy.minPrice : -Infinity

  filteredToys = filteredToys.filter(
    (toy) => toy.price <= filterBy.maxPrice && toy.price >= filterBy.minPrice,
  )

  // filteredToys.sort((toy1, toy2) => {
  //   const dir = JSON.parse(sort.asc) ? 1 : -1
  //   if (sort.by === "price") return (toy1.price - toy2.price) * dir
  //   if (sort.by === "name") return toy1.name.localeCompare(toy2.name) * dir
  // })

  return filteredToys
}
async function getById(toyId) {
  let toy = toys.find((toy) => toy._id === toyId)
  if (!toy) throw new Error("No such toy.")
  toy = _setNextPrevToyId(toy)
  return toy
}

async function save(toyToSave) {
  if (toyToSave._id) {
    const idx = toys.findIndex((toy) => toy._id === toyToSave._id)
    if (idx === -1) throw new Error(`no such toy`)
    toys[idx] = { ...toys[idx], ...toyToSave }
  } else {
    toyToSave._id = makeId()
    toyToSave.createdAt = new Date(Date.now())
    ;((toyToSave.imgUrl = `https://robohash.org/${toyToSave.name}?set=set2`),
      toys.push(toyToSave))
  }
  await _saveToysToFile()
  return toyToSave
}

async function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) throw new Error(`no such toy`)
  toys.splice(idx, 1)
  await _saveToysToFile()
  return
}

function _saveToysToFile() {
  return writeJsonFile(PATH, toys)
}

function _setNextPrevToyId(toy) {
  const toyIdx = toys.findIndex((currToy) => currToy._id === toy._id)
  const nextToy = toys[toyIdx + 1] ? toys[toyIdx + 1] : toys[0]
  const prevToy = toys[toyIdx - 1] ? toys[toyIdx - 1] : toys[toys.length - 1]
  toy.nextToyId = nextToy._id
  toy.prevToyId = prevToy._id
  return toy
}


