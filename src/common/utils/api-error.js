class ApiError extends Error{
    constructor(statusCode, message){
        super(message)
        this.statusCode= statusCode
        this.isOperational= true // Production ready code (Flag )
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message="Bad Request"){
        return new ApiError(400,meassage)
    }
    static unauthorized(message="Unauthorized"){
        return new ApiError(401, message)
    }
    static confilct(message="Conflict"){
        return new ApiError(409, message)
    }

    static forbidden(message="Forbidden"){
        return new ApiError(403,message)
    }

    static notFound(message="Not Found"){
        return new ApiError(404,message)
    }

    static internal(message="Internal Server Error") {
        return new ApiError(500, message)
    }
}


export default ApiError