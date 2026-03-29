import mongoose from "mongoose"

const connectDB = async ()=>{
    const conn= await mongoose.connect(process.env.MONGODB_URI)
    // what's inside this conn ?
    // console.log(conn) //returns the entire Mongoose Connection Object.
    
    // This tells you the specific URL/IP of the cluster you connected to
    // console.log(`MongoDB Host: ${conn.connection.host}`); //MongoDB Host: ac-rsv8ccb-shard-00-00.hxjse7l.mongodb.net

    // This tells you the specific name of the database you are inside
    // console.log(`Database Name: ${conn.connection.name}`); //Database Name: Cohort

    console.log(`MongoDB Connected: ${conn.connection.host}`) // MongoDB Connected: ac-rsv8ccb-shard-00-00.hxjse7l.mongodb.net


}



export default connectDB