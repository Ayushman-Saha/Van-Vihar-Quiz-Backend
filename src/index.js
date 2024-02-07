import dotenv from "dotenv"
import connectDB from "../src/db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})
console.log(process.env)
console.log(typeof(process.env.MONGO_URI))

connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=> {
    console.log("MongoDB connection failed!! ", err)
})

