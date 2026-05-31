import express from "express"

// prettier-ignore
import { requireAdmin,requireAuth } from "../../middlewares/requireAuth.middleware.js"
import { log } from "../../middlewares/logger.middleware.js"

import {
  getToys,
  getToyById,
  saveToy,
  removeToy,
  addToyMsg,
  removeToyMsg,
} from "./toy.controller.js"
import { getUser } from "../user/user.controller.js"

export const toyRoutes = express.Router()

toyRoutes.get("/", log, getToys)
toyRoutes.get("/:id", log, getToyById)
toyRoutes.post("/", requireAuth, requireAdmin, saveToy) // Add
toyRoutes.put("/:id", requireAuth, requireAdmin, saveToy) // Update
toyRoutes.delete("/:id", requireAuth, requireAdmin, removeToy)

toyRoutes.post("/:id/msg", requireAuth, addToyMsg)
toyRoutes.delete("/:id/msg/msgId", requireAuth, requireAdmin, removeToyMsg)
