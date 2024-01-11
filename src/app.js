import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()   

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("static"))
app.use(cookieParser())

//Routes import
import quizQuestionRouter from "../src/routes/quizQuestion.routes.js"
import quizResultRouter from "../src/routes/quizResult.routes.js"

//Routes declaration
app.use("/api/v1/quizQuestion",quizQuestionRouter)
app.use("/api/v1/quizResult", quizResultRouter)

export {app}