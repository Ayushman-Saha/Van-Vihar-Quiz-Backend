import { Router } from "express";
import { addQuestions, getQuestions } from "../controllers/quizQuestion.controller.js";

const router = Router()

router.route("/add").post(addQuestions)
router.route("/get").get(getQuestions)


export default router