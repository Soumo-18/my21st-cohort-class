import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class CreateOwnerDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        company: Joi.string().trim().min(2).max(100).required()
    })
}


class UpdateOwnerDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).optional(),
        company: Joi.string().trim().min(2).max(100).optional(),
    }).min(1)
}    


export  { CreateOwnerDto, UpdateOwnerDto}