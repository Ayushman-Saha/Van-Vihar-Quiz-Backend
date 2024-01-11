import mongoose, { Schema } from "mongoose";

const quizResultSchema = new Schema({
    uid: {
        type : String,
        required: true,
        trim : true,
    },
    name: {
        type : String,
        required: true,
        trim : true,
    },
    email: {
        type : String,
        required: true,
        trim : true,
    },
    score: {
        type : Number,
        required: true,
    },
    timeTaken: {
        type: Number,
        required: true
    }

},{
    timestamps: true
})

export const QuizResult = mongoose.model("quizResult", quizResultSchema)

