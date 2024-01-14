import { QuizResult } from "../models/quizResults.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb"

const addResult = asyncHandler(async(req,res) => {

    const {uid,name,email,score,timeTaken, attemptedQuestionIds, correctAttemptedQuestionIds} = req.body

     //Cheking if all the required fields are there
     if (
        [uid,name,email,score,timeTaken,attemptedQuestionIds,correctAttemptedQuestionIds].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedResult = await QuizResult.findOne({
        $and: [{ uid },{email}]
    })

    if (existedResult) {
        throw new ApiError(409, "Multiple entries are not permitted")
    }
    
    let oAttemptedQuestionIds = []
    attemptedQuestionIds.forEach(attemptedQuestionId => {
        oAttemptedQuestionIds.push(ObjectId(attemptedQuestionId))
    })

    let oCorrectAttemptedQuestionIds = []
    correctAttemptedQuestionIds.forEach(correctAttemptedQuestionId => {
        oCorrectAttemptedQuestionIds.push(ObjectId(correctAttemptedQuestionId))
    })

    const result = await QuizResult.create({
        uid,
        name,
        email,
        score,
        timeTaken,
        oAttemptedQuestionIds,
        oCorrectAttemptedQuestionIds
    })


    const createdResult = await QuizResult.findById(result._id)

    if(!createdResult) {
        throw new ApiError(500, "Something went wrong while registering the result")
    }

    return res.status(201).json(
        new ApiResponse(200, createdResult, "Result registered Successfully")
    )
})


const getResult = asyncHandler(async(req, res) => {
    let uid = req.query.uid

    let user = await QuizResult.findOne({
        uid: uid
    })
    if(user!=null) {
        return res.status(200).json(
            new ApiResponse(200, user, "User result fetched successfully!")
        )
    } else {
       return res.status(404).json(
        new ApiResponse(404, null, "User not found!")
       )
    }
    
})
const clearResult = asyncHandler(async(req, res) => {
    let uid = req.query.uid

    let userResult = await QuizResult.findOne({
        uid: uid
    })
    if(userResult !=null) {
        let data = await QuizResult.deleteOne({
            uid: uid
        })
        if(data.deletedCount == 1) {
            return res.status(200).json(
                new ApiResponse(200, null, "User result removed successfully")
            )
        } else {
            return res.status(500).json(
                new ApiResponse(500, null, "Error while deleting user result")
            )
        }
    } else {
       return res.status(404).json(
        new ApiResponse(404, null, "User not found!")
       )
    }
    
})

export {addResult, getResult, clearResult}