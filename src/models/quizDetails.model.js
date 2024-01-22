import mongoose, { Schema } from "mongoose";

const quizDetailsSchema = new Schema({
    questionCount: {
        type: Number,
        required: true
    },
    marksEasy: {
        type: Number,
        required: true
    },
    marksMedium: {
        type: Number,
        required: true
    },
    marksHard: {
        type: Number,
        required: true
    },
    tags: [
        {type: String}
    ],
    timeLimit: {
        type: Number,
        required: true
    }
},{
    timestamps: true
})

export const QuizDetails = mongoose.model("quizDetails", quizDetailsSchema)

