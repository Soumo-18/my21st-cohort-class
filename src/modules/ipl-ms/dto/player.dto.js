import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";


class CreatePlayerDto extends BaseDto { 
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        role: Joi.string().valid("batsman", "bowler", "all-rounder", "wicket-keeper").required(),
        teamId: Joi.string().hex().length(24).message("teamId must be a valid MongoDB ObjectId").required()
    })
}    


class UpdatePlayerDto extends BaseDto { 
    static schema = Joi.object( {
        name: Joi.string().trim().min(2).max(100).optional(),
        role: Joi.string().valid("batsman", "bowler", "all-rounder", "wicket-keeper").optional(),
        teamId: Joi.string().hex().length(24).message("teamId must be a valid MongoDB ObjectId").optional()
    }).min(1)
}


class TransferPlayerDto extends BaseDto {
    static schema = Joi.object({
        newTeamId: Joi.string().hex().length(24).message("newTeamId must be a valid MongoDB ObjectId").required()
    })
}

class UpdatePlayerRoleDto extends BaseDto {
    static schema = Joi.object({
        role: Joi.string().valid("batsman", "bowler", "all-rounder", "wicket-keeper").required()
    })
}    


export { CreatePlayerDto, UpdatePlayerDto, TransferPlayerDto,UpdatePlayerRoleDto  }