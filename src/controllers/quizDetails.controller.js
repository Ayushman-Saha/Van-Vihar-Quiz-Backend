import { QuizDetails } from "../models/quizDetails.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getQuestionDetails = asyncHandler(async(req, res ) => {
    const response = await QuizDetails.findById("65a76a49bf9a139ba903ab07")
    if(!response) {
        throw new ApiError(500, "Error while fetching question details")
    }
    res.status(200).json(
        new ApiResponse(200, response, "Details fetched successfully")
    )
})

const updateQuestionDetails = asyncHandler(async(req,res) => {
    let {data} = req.body
    const response = await QuizDetails.updateOne(
        {_id: "65a76a49bf9a139ba903ab07"},
        {$set: data}
    )

    if(response.modifiedCount === 1) {
        res.status(200).json(
            new ApiResponse(200,response,"Quiz details modified successfully!")
        )
    } else {
        throw new ApiError(500, "Error while updating tge details")
    }
})

// const addQuizDetails = asyncHandler(async(req,res)=> {
//     let response = await QuizDetails.create({
//         "questionCount" : 2,
//         "marksEasy" : 1,
//         "marksMedium" : 2,
//         "marksHard" : 5,
//         tags: []
//     })

//     const createdDetails =await QuizDetails.findById(response._id)

//     if(!createdDetails) {
//         throw new ApiError(500, "Error while adding the details")
//     }

//     res.status(200).json(
//         new ApiResponse(201, createdDetails, "New details added successfully")
//     )
// })

export {getQuestionDetails, updateQuestionDetails}