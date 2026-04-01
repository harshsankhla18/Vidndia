import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
    path: './.env'
});
connectDB()
.then(()=>{
    app.on("error",(err)=>{
            console.log("Err:",err);
            throw err
        })
    app.listen(process.env.PORT,()=>{
            console.log("App sun rha hai....");
        })
    }
)