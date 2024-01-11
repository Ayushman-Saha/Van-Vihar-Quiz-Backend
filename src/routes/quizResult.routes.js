import { Router } from "express";
import { addResult, clearResult, getResult } from "../controllers/quizResult.controller.js";

const router = Router()

router.route("/add").post(addResult)
router.route("/get").get(getResult)
router.route("/clear").post(clearResult)

export default router