import Joi from "joi";

class BaseDto{
    static schema = Joi.object({}) // this acts as a empty placeholder. subclasses will overwrite thi with their speciic rules
   
    static validate(data){ //takes raw data and runs it against the schema
        const { error,value}= this.schema.validate(data, {
            abortEarly:false, // this ensures Joi chekcs every field and returns a list of all error at once, rather than stopping at the very first mistake it finds.
            stripUnknown:true //It's a security feature.If a user tries to sneak extra unapproved data into the request into the request(like isAdmin:true),Joi will automatically strip it out before passing the data forward.
        })
        if(error){
            const errors = error.details.map((d)=> d.message)
            return{errors, value:null} //It neatly formats the result. If validation fails, it returns an array of easy-to-read error messages. If it succeeds, it returns the cleaned-up value and errors: null
        }
        return {errors:null, value}
    }
}

export default BaseDto