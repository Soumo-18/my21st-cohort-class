import Joi from "joi";

import BaseDto from '../../../common/dto/base.dto.js'

class CreateTeamDto extends BaseDto {
    static schema = Joi.object( {
        name: Joi.string().trim().min(2).max(100).required() ,
        ownerId: Joi.string().hex().length(24).message("ownerId must be a valid MongoDB ObjectId").required()
    })
}

class UpdateTeamDto extends BaseDto {
    static schema = Joi.object( {
        name: Joi.string().trim().min(2).max(100).optional(),
        ownerId: Joi.string().hex().length(24).message("ownerId must be a valid MongoDB ObjectId").optional()
    }).min(1) //ensures at least 1 field is provided for an update
}

export { CreateTeamDto, UpdateTeamDto }