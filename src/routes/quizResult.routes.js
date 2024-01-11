import { Router } from "express";
import { addResult, getResult } from "../controllers/quizResult.controller.js";

const router = Router()

router.route("/add").post(addResult)
router.route("/get").get(getResult)

export default router