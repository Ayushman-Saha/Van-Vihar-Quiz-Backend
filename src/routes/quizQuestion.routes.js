import { Router } from "express";
import { addQuestions, getMarkingScheme, getQuestions, getQuestionReport, getQuestionsByTags, updateQuestion, removeQuestion, getQuestionById, getQuestionTagsReport} from "../controllers/quizQuestion.controller.js";

const router = Router()

router.route("/add").post(addQuestions)
router.route("/get").get(getQuestions)
router.route("/getMarkingScheme").get(getMarkingScheme)
router.route("/getQuestionReport").get(getQuestionReport)
router.route("/getQuestionByTags").get(getQuestionsByTags),
router.route("/updateQuestion").patch(updateQuestion)
router.route("/deleteQuestion").delete(removeQuestion)
router.route("/getQuestionById").get(getQuestionById)
router.route("/getQuestionTagsReport").get(getQuestionTagsReport)


export default router