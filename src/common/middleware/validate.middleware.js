import ApiError from "../utils/api-error.js"

const validate = (Dtoclass) => {
    return (req,res,next) => {
        const {errors, value} = Dtoclass.validate(req.body)
//it takes the incoming data 'req.body' and checks it against the RegisterDto Rules
        if(errors){ // if it fails
            throw ApiError.badRequest(errors.join(" ; "))
        }

        req.body=value //if it passes: it updates req.body=value(this is useful bcz like 
        // Joi often strip out malicious hidden fields or trim white spaces)

        next() //Magic word in Express,means 
        // "This REQUEST is SAFE.Pass it to the next fucntion in line(which is our controller)"
     }
}


export default validate