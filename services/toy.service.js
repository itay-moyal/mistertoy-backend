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
console.log("toys", toys)

function query(queryOptions = {}) {
  const { filterBy, sortBy } = queryOptions
  console.log("queryOptions", queryOptions)
  if (!filterBy) return Promise.resolve(toys)

  let filteredToys = toys

  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, "i")
    filteredToys = filteredToys.filter((toy) => regExp.test(toy.name))
  }
  if (filterBy.labels && filterBy.labels.length > 0) {
    filteredToys = filteredToys.filter((toy) => {
      toy.labels.some((label) => filterBy.labels.includes(label))
    })
  }
  if (filterBy.inStock) {
    filteredToys = filteredToys.filter((toy) => {
      toy.inStock === JSON.parse(filterBy.inStock)
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

  return Promise.resolve(filteredToys)
}
function getById(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  return Promise.resolve(toy)
}

function save(toyToSave) {
  if (toyToSave._id) {
    const idx = toys.findIndex((toy) => toy._id === toyToSave._id)
    if (idx === -1) return Promise.reject("No such toy.")
    toys[idx] = { ...toys[idx], ...toyToSave }
  } else {
    toyToSave._id = makeId()
    toyToSave.createdAt = new Date(Date.now())
    toys.push(toyToSave)
  }
  _saveToysToFile()
  return Promise.resolve(toyToSave)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject("No such toy.")
  toys.splice(idx, 1)
  _saveToysToFile()
  return Promise.resolve()
}

function _saveToysToFile() {
  return writeJsonFile(PATH, toys)
}
