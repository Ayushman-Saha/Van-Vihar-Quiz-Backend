import { Router } from "express";
import { getQuestionDetails, updateQuestionDetails } from "../controllers/quizDetails.controller.js";

const router = Router()

router.route("/get").get(getQuestionDetails)
router.route("/update").patch(updateQuestionDetails)

export default router