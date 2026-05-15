import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { log } from "console"

import { toyService } from "./services/toy.service.js"
import { loggerService } from "./services/logger.service.js"

const app = express()
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())
app.set("query parser", "extended")

if (process.env.NODE_ENV === "production") {
  app.use(express.static("public"))
} else {
  const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",

      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

// TOY API

app.get("/api/toy", async (req, res) => {
  const queryOptions = parseQueryParams(req.query)

  console.log(queryOptions)
  try {
    const toys = await toyService.query(queryOptions)
    return res.send(toys)
  } catch (err) {
    loggerService.error(err)
    res.status(404).send("Can't get toys")
  }
})

app.get("/api/toy/:id", async (req, res) => {
  const toyId = req.params.id

  try {
    const toy = await toyService.getById(toyId)
    return res.send(toy)
  } catch (err) {
    loggerService.error(err)
    res.status(404).send("Can't find toy")
  }
})

app.put("/api/toy/:id", async (req, res) => {
  const toy = req.body

  try {
    const savedToy = await toyService.save(toy)
    return res.send(savedToy)
  } catch (err) {
    loggerService.error(err)
    res.status(404).send("Can't save toy")
  }
})

app.delete("/api/toy/:id", async (req, res) => {
  const toyId = req.params.id
  try {
    const toyToRemove = await toyService.remove(toyId)
    res.send("Removed!")
  } catch (err) {
    loggerService.error(err)
    res.status(404).send("Can't find toy to remove")
  }
})

app.post("/api/toy", async (req, res) => {
  const toy = req.body

  try {
    const savedToy = await toyService.save(toy)
    res.send(savedToy)
  } catch (err) {
    loggerService.error(err)
    res.status(404).send("Can't save toy")
  }
})

//  QUERY PARAMS

function parseQueryParams(queryParams) {
  const filterBy = {
    txt: queryParams.txt || "",
    inStock: +queryParams.inStock || "",
    labels: queryParams.labels || [],
  }
  const sort = {
    sortField: queryParams.sortField || "",
    sortDir: +queryParams.sortDir || 1,
  }

  return { filterBy, sort }
}

const port = 3030
app.listen(port, () => {
  console.log("Server is up and listening to", port)
})
