import { QuizResult } from "../models/quizResults.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addResult = asyncHandler(async(req,res) => {

    const {uid,name,email,score,timeTaken} = req.body

     //Cheking if all the required fields are there
     if (
        [uid,name,email,score,timeTaken].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedResult = await QuizResult.findOne({
        $and: [{ uid },{email}]
    })

    if (existedResult) {
        throw new ApiError(409, "Multiple entries are not permitted")
    }

    const result = await QuizResult.create({
        uid,
        name,
        email,
        score,
        timeTaken
    })

    const createdResult = await QuizResult.findById(result._id)

    if(!createdResult) {
        throw new ApiError(500, "Something went wrong while registering the result")
    }

    return res.status(201).json(
        new ApiResponse(200, createdQuestion, "Result registered Successfully")
    )
})


const getResult = asyncHandler(async(req, res) => {
    let uid = req.body.uid

    let user = await QuizResult.findOne({
        uid: uid
    })

    return res.status(200).json(
        new ApiResponse(200, user, "User result fetched successfully!")
    )
})

export {addResult, getResult}