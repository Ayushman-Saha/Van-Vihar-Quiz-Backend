import { QuizQuestion } from "../models/quizQuestion.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const addQuestions = asyncHandler(async(req, res) => {

    let {question, hasAttachment, attachmentType, answerType, attachment,answerChoices, correctAnswer, answerDescription, answerDescriptionAttachment, difficulty, descriptionAttachment, tags} = req.body

    //Cheking if all the required fields are there
    if (
        [question, hasAttachment, answerType, answerChoices,correctAnswer,answerDescription, difficulty].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedQuestion = await QuizQuestion.findOne({
        $and: [{ question },{answerChoices}]
    })

    if (existedQuestion) {
        throw new ApiError(409, "Same question already exist in the question bank")
    }

    if(hasAttachment && attachmentType === "image") {
        let response = await uploadOnCloudinary(attachment)
        attachment = response.url
    }

    if(answerType === "image") {
        let responses = []
        answerChoices.forEach(async choice => {
            let response = await uploadOnCloudinary(choice)
            responses.push(response.url)
        })
        answerChoices = responses
    }

    if(descriptionAttachment != null) {
        let response = await uploadOnCloudinary(descriptionAttachment)
        descriptionAttachment = response.url
    }

    const quizQuestion =  await QuizQuestion.create({
        question,
        hasAttachment,
        attachmentType,
        answerType,
        attachment,
        answerChoices,
        correctAnswer,
        answerDescription,
        answerDescriptionAttachment,
        difficulty,
        descriptionAttachment,
        marks: (difficulty === "easy") ? parseInt(process.env.MARKS_EASY) : ((difficulty === "medium")? parseInt(process.env.MARKS_MEDIUM): parseInt(process.env.MARKS_HARD)),
        tags
    })

    const createdQuestion = await QuizQuestion.findById(quizQuestion._id)

    if(!createdQuestion) {
        throw new ApiError(500, "Something went wrong while registering the question")
    }

    return res.status(201).json(
        new ApiResponse(200, createdQuestion, "Question registered Successfully")
    )
})

const getQuestions = asyncHandler(async(req, res) => {

    let sampleSize = parseInt(process.env.SAMPLE_SIZE)

   const responseMedium = await QuizQuestion.aggregate([
        {
            $match: {
                difficulty: "medium"
            }
        },
        {
            $sample: {
                size: sampleSize
            }
        }
    ])

    const responseEasy = await QuizQuestion.aggregate([
        {
            $match: {
                difficulty: "easy"
            }
        },
        {
            $sample: {
                size: sampleSize,
            }
        }
    ])

    const responseHard = await QuizQuestion.aggregate([
        {
            $match: {
                difficulty: "hard"
            }
        },
        {
            $sample: {
                size: sampleSize
            }
        }
    ])

    const response = responseEasy.concat(responseMedium).concat(responseHard)
    

    return res.status(200).json(
        new ApiResponse(200, response, "Questions fetched successfully")
    )
})

const getMarkingScheme = asyncHandler(async(req,res) => {
    let easy = parseInt(process.env.MARKS_EASY)
    let medium = parseInt(process.env.MARKS_MEDIUM)
    let hard = parseInt(process.env.MARKS_HARD)

    let data = {
        "easy": easy,
        "medium": medium,
        "hard" : hard
    }

    res.status(200).json(
        new ApiResponse(200,data,"Marking scheme fetched successfully!")
    )
})

const getQuestionReport = asyncHandler(async(req,res)=> {
    const questions = await QuizQuestion.aggregate(
        [
            {
                $lookup: {
                from: "quizresults",
                localField: "_id",
                foreignField: "attemptedQuestionIds",
                as:"attemptsArray"
              }
            },
            {
                $addFields: {"attempts": {$size:"$attemptsArray"}}
               
            },
            {
                $project:{
                 "attemptsArray" : 0
               }
            },
            {
                $lookup : {
                 from: "quizresults",
                 localField: "_id",
                 foreignField: "correctAttemptedQuestionIds",
                 as:"correctAttemptsArray"
               }
            },
            {
                $addFields: {"correctAttempts": {$size:"$correctAttemptsArray"}}
            },
            {
                $project: {
                    "correctAttemptsArray": 0
                }
            }
        ]
    )
    res.status(200).json(
        new ApiResponse(200,questions,"Data success")
    )
})



export {addQuestions, getQuestions,getMarkingScheme, getQuestionReport}