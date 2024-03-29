import { Router } from "express";
import { addResult, clearResult, getAllLeaderboard, getDailyPlayers, getLeaderBoard, getMonthlyPlayers, getResult } from "../controllers/quizResult.controller.js";

const router = Router()

router.route("/add").post(addResult)
router.route("/get").get(getResult)
router.route("/clear").post(clearResult)
router.route("/getLeaderBoard").get(getLeaderBoard)
router.route("/getDailyPlayers").get(getDailyPlayers)
router.route("/getMonthlyPlayers").get(getMonthlyPlayers)
router.route("/getAllLeaderboard").get(getAllLeaderboard)

export default router