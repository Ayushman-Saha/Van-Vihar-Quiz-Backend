import { QuizQuestion } from "../models/quizQuestion.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import { response } from "express"

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
        if(response == null) {
            new ApiError(400, "Cloudinary error.Kindly check the links attached")
        }
        attachment = response.url
    }

    if(answerType === "image") {
        let responses = []
        let correctIndex = answerChoices.indexOf(correctAnswer)

        if(correctIndex === -1) {
            throw new ApiError(400, "Correct answer not in answer choices")
        }

        for(const choice of answerChoices) {
            let response = await uploadOnCloudinary(choice)
            if(response === null) {
               throw new ApiError(400, "Cloudinary error.Kindly check the links attached")
            }

            if(choice === answerChoices[correctIndex]) {
                correctAnswer = response.url
            }

            responses.push(response.url)
        }
        answerChoices = responses
    }

    if(descriptionAttachment != null) {
        let response = await uploadOnCloudinary(descriptionAttachment)
        if(response === null) {
            new ApiError(400, "Cloudinary error.Kindly check the links attached")
        }
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

    let {questionCount,tags} = req.query

    if(tags!=null) tags = tags.split(",")
    
    questionCount = parseInt(questionCount)

    let sampleSize = questionCount/2 + 2

    let noTagPipeline = [
       { $facet: {
            "easyQuestions": [
              {
                      $match: {
                          difficulty: "easy"
                      }
                  },
                  {
                      $sample: {
                          size: sampleSize
                      }
                  }
            ],
            "mediumQuestions" : [
              {
                      $match: {
                          difficulty: "medium"
                      }
                  },
                  {
                      $sample: {
                          size:sampleSize
                      }
                  }
            ],
            "hardQuestions" : [
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
            ]
          }
        }
    ]

    let tagPipeline = [
        {
            $facet: {
            "easyQuestions": [
                {
                    $match: {
                        "tags": {$in: tags}
                    }
                },
              {
                      $match: {
                          difficulty: "easy"
                      }
                  },
                  {
                      $sample: {
                          size: sampleSize
                      }
                  }
            ],
            "mediumQuestions" : [
                {
                    $match: {
                        "tags": {$in: tags}
                    }
                },
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
            ],
            "hardQuestions" : [
                {
                    $match: {
                        "tags": {$in: tags}
                    }
                },
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
            ]
          }
        }
    ]

//     console.log(noTagPipeline)

    let pipeLine = (tags == undefined)? noTagPipeline : tagPipeline

   let response = await QuizQuestion.aggregate(pipeLine)

   if(response == null) {
    throw new ApiError(500, "Error while fetching questions")
   }

    return res.status(200).json(
        new ApiResponse(200, response, "Questions fetched successfully")
    )
})

const getQuestionById = asyncHandler(async(req,res)=> {
    let {id} = req.query
    let questionId = new mongoose.Types.ObjectId(id)
    if(id!=null) {
        const question = await QuizQuestion.findById(questionId)
        if(question != null) {
            res.status(200).json(
                new ApiResponse(200,question,"Question fetched successfully!")
            )
        } else {
            throw new ApiError(404, "No question exists with given Id")
        }
    } else {
        throw new ApiError(400, "id is a required parameter")
    }
})

const getQuestionsByTags = asyncHandler(async(req, res) => {

    if (req.query.q == null) {
        throw new ApiError(400, "All fields are required")
    }

    let query = req.query.q.split(',')

   const responseMedium = await QuizQuestion.aggregate([
    {
        $match: {
            "tags": {$in: query}
        }
    },
        {
            $match: {
                difficulty: "medium"    
            }
        },
    ])

    const responseEasy = await QuizQuestion.aggregate([
        {
            $match: {
                "tags": {$in: query}
            }
        },
        {
            $match: {
                difficulty: "easy"
            }
        }
    ])

    const responseHard = await QuizQuestion.aggregate([
        {
            $match: {
                "tags": {$in: query}
            }
        },
        {
            $match: {
                difficulty: "hard"
            }
        }
    ])

    const response = responseEasy.concat(responseMedium).concat(responseHard)
    

    return res.status(200).json(
        new ApiResponse(200, response, "Questions fetched successfully")
    )
})

const getMarkingScheme = asyncHandler(async(req,res) => {
    let easy = parseInt(process.env.c_EASY)
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

const getQuestionTagsReport = asyncHandler(async(req,res)=> {
    const tagsReport = await QuizQuestion.aggregate([
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
        },
        {
            $unwind: "$tags"
        }, 
        {
            $group: {
                _id: "$tags",
                attempt : {$sum: "$attempts"},
                correctAttempt : {$sum : "$correctAttempts"}
              }
        }
    ])

    if(tagsReport === null) {
        throw new ApiError(500, "Error while fetching the tag report")
    } else {
        res.status(200).json(
            new ApiResponse(200, tagsReport, "Tags report fetched successfully!")
        )
    }
})

const updateQuestion = asyncHandler(async(req,res)=> {
    let {id} = req.query
    let {data} = req.body

    if(data.hasAttachment && data.attachmentType === "image") {
        let response = await uploadOnCloudinary(data.attachment)
        if(response == null) {
            new ApiError(400, "Cloudinary error.Kindly check the links attached")
        }
        data.attachment = response.url
    }

    if(data.answerType === "image") {
        let responses = []
        let correctIndex = data.answerChoices.indexOf(data.correctAnswer)

        if(correctIndex === -1) {
            throw new ApiError(400, "Correct answer not in answer choices")
        }

        for(const choice of data.answerChoices) {
            let response = await uploadOnCloudinary(choice)
            if(response === null) {
               throw new ApiError(400, "Cloudinary error.Kindly check the links attached")
            }

            if(choice === data.answerChoices[correctIndex]) {
                data.correctAnswer = response.url
            }

            responses.push(response.url)
        }
        data.answerChoices = responses
    }

    if(data.descriptionAttachment != null) {
        let response = await uploadOnCloudinary(data.descriptionAttachment)
        if(response === null) {
            new ApiError(400, "Cloudinary error.Kindly check the links attached")
        }
        data.descriptionAttachment = response.url
    }


    const updateResponse = await QuizQuestion.updateOne(
        {_id:new mongoose.Types.ObjectId(id)},
        {$set: data}
    )

    if(updateResponse.modifiedCount == 1) {
        res.status(200).json(
            new ApiResponse(200, updateResponse, "Question updated successfully")
        )
    } else {
        new ApiError(400, "Error occured while updating the question")
    }
})

const removeQuestion = asyncHandler(async(req,res)=> {
    let {id} = req.query
    let deleteResponse = await QuizQuestion.deleteOne(
        {_id: new mongoose.Types.ObjectId(id)}
    )

    if(deleteResponse.deletedCount == 1) {
        res.status(200).json(
            new ApiResponse(200, deleteResponse, "Document deleted successfully!")
        )
    } else {
        new ApiError(400, "Error in deleting the document")
    }
})

export {addQuestions, getQuestions,getMarkingScheme, getQuestionReport, getQuestionsByTags, updateQuestion, removeQuestion, getQuestionById, getQuestionTagsReport}