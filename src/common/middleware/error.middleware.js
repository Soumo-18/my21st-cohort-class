import multer from "multer";
import ApiError from "../utils/api-error.js";

const errorHandler = (err,req,res,next) => {

    if(err instanceof multer.MulterError) {
        if(err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success:false,
                message:'File Too Large (MAX 5 MB is allowed)',
            })
        }
        return res.status(400).json({
        sucess:false,
        message: err.message
        })
    }
    


    if(err instanceof ApiError){
        return res.status(err.statusCode).json({
            success:false,
            message:err.message
        })
    }

    console.error(err)
    return res.status(500).json({
        sucess:false,
        message:'Internal Server Error'
    })
}
export default errorHandler
