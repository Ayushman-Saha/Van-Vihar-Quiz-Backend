import { QuizResult } from "../models/quizResults.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ObjectId } from "mongodb"

const addResult = asyncHandler(async(req,res) => {

    const {uid,name,email,score,timeTaken,displayPicture,attemptedQuestionIds, correctAttemptedQuestionIds} = req.body

     //Cheking if all the required fields are there
     if (
        [uid,name,email,score,timeTaken,attemptedQuestionIds,correctAttemptedQuestionIds].some((field) => field === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    
    const result = await QuizResult.create({
        uid,
        name,
        email,
        score,
        timeTaken,
        displayPicture,
        attemptedQuestionIds,
        correctAttemptedQuestionIds
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

const getLeaderBoard = asyncHandler(async(req,res)=> {
    const {size} = req.query
    let limit = parseInt(size)
    let pipeline = []
    let localDate = new Date()
    const formattedDate = `${localDate.getUTCFullYear()}-${(localDate.getUTCMonth() + 1).toString().padStart(2,'0')}-${localDate.getUTCDate().toString().padStart(2,'0')}`

    let notNullPipeline = [
        {
            $sort: {"score":-1, "timeTaken": 1}
        },
        { $addFields : {
            "creationDate":  {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}}
          }
       },
        {
            $match: {
                creationDate:  {$eq: formattedDate}
              }
        },
        {
            $limit: 10
        },
        {
            $project: {
                "creationDate" : 0,
                "attemptedQuestionIds" : 0,
                "correctAttemptedQuestionIds" : 0,
                "updatedAt": 0,
                "__v": 0
            }
        }
    ]

    let nullPipeline = [
        [
            {
                $sort: {"score":-1, "timeTaken": 1}
            },
            { $addFields : {
                "creationDate":  {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}}
              }
           },
            {
                $match: {
                    creationDate:  {$eq: formattedDate}
                  }
            },
            {
                $project: {
                    "creationDate" : 0,
                    "attemptedQuestionIds" : 0,
                    "correctAttemptedQuestionIds" : 0,
                    "updatedAt": 0,
                    "__v": 0
                }
            }
        ]
    ]

    if(!size) {
        pipeline = nullPipeline
    } else {
        pipeline = notNullPipeline
    }

    let leaderBoard = await QuizResult.aggregate(pipeline)

    res.status(200).json(
        new ApiResponse(200,leaderBoard,"Data success")
    )
})

const getDailyPlayers = asyncHandler(async(req, res) => {

    let {date} = req.query

    if(date === null) {
        throw new ApiError(400, "Date as query is required")
    }

    let dailyPlayers = await QuizResult.aggregate([
       { $addFields : {
            "creationDate":  {$dateToString:{format: "%Y-%m-%d", date: "$createdAt"}}
          }
       },
       {
        
        $match: { creationDate:  {$eq: date}}}
    ])

    res.status(200).json(
        new ApiResponse(200, dailyPlayers, "Successfully fetch daily user")
    )
})

const getMonthlyPlayers = asyncHandler(async(req, res) => {

    let {month} = req.query

    if(month === null) {
        throw new ApiError(400, "Date as query is required")
    }

    let monthlyPlayers = await QuizResult.aggregate([
       { $addFields : {
            "creationMonth":  {$dateToString:{format: "%m", date: "$createdAt"}}
          }
       },
       {
        
        $match: { creationMonth:  {$eq: month}}}
    ])

    res.status(200).json(
        new ApiResponse(200, monthlyPlayers, "Successfully fetch daily user")
    )
})

const getAllLeaderboard = asyncHandler(async(req,res)=> {
    let leaderBoard = await QuizResult.aggregate([
        {
            $sort: {"score":-1, "timeTaken": 1}
        },
        { $addFields : {
            "playerType": {
                $cond: {
                  if:{ $regexMatch: {input: "$email",regex: /@/}},then: "app",
                  else: "kiosk"
                }
              }
          }
       },
        {
            $project: {
                "creationDate" : 0,
                "attemptedQuestionIds" : 0,
                "correctAttemptedQuestionIds" : 0,
                "updatedAt": 0,
                "__v": 0
            }
        }

    ])

    if(leaderBoard == null) {
        throw new ApiError(500, "Couldn't fetch the leaderboard")
    }

    res.status(200).json(
        new ApiResponse(200, leaderBoard, "Fetched leaderboard successfully!")
    )
})

export {addResult, getResult, clearResult, getLeaderBoard, getDailyPlayers, getMonthlyPlayers, getAllLeaderboard}