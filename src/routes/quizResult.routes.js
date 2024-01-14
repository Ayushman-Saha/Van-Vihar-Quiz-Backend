import { Router } from "express";
import { addResult, clearResult, getLeaderBoard, getResult } from "../controllers/quizResult.controller.js";

const router = Router()

router.route("/add").post(addResult)
router.route("/get").get(getResult)
router.route("/clear").post(clearResult)
router.route("/getLeaderBoard").get(getLeaderBoard)

export default router