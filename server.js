import "dotenv/config"
import app from "./src/app.js"
import connectDB from  "./src/common/config/db.js"


const PORT= process.env.PORT || 5000

const start = async ()=> {
    //connect to db
    await connectDB()
    app.listen(PORT, () => {
        console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV} mode`)

    })
}

start().catch((err)=>{
    console.log("Failed to Start the Server", err)
    process.exit(1) //1 stands for "Uncaught Fatal Exception." It tells Node.js, 
    // "Something went horribly wrong (like the database refusing to connect), 
    // shut down the app immediately!" It will drop any active user requests right then and there.
})