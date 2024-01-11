import mongoose, {Schema} from "mongoose"

const quizQuestionSchema = new Schema({
    question: {
        type : String,
        required: true,
        trim : true,
    },
    hasAttachment: {
        type: Boolean,
        required: true,
    },
    attachmentType: {
        type : String,
        trim : true,
    },
    answerType: {
        type : String,
        required: true,
        trim : true,
    },
    attachment: {
        type : String,
        trim : true,
    },
    answerChoices: [
        {
            type : String,
            required: true,
            trim : true,
        }
    ],
    correctAnswer: {
        type : String,
        required: true,
        trim : true,
    },
    answerDescription: {
        type : String,
        required: true,
        trim : true,
    },
    answerDescriptionAttachment: {
        type : String,
        trim : true,
    },
    difficulty: {
        type: String,
        required : true,
        trim : true
    },
    descriptionAttachment: {
        type: String,
        trim: true
    }
},{
    timestamps: true
})

export const QuizQuestion = mongoose.model("QuizQuestion",quizQuestionSchema)