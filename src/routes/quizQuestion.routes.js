import { Router } from "express";
import { addQuestions, getMarkingScheme, getQuestions, getQuestionReport, getQuestionsByTags} from "../controllers/quizQuestion.controller.js";

const router = Router()

router.route("/add").post(addQuestions)
router.route("/get").get(getQuestions)
router.route("/getMarkingScheme").get(getMarkingScheme)
router.route("/getQuestionReport").get(getQuestionReport)
router.route("/getQuestionByTags").get(getQuestionsByTags)


export default router