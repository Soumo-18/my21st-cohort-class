import ApiError from "../../../common/utils/api-error.js";

import Team from "../models/team.model.js";

const createTeam = async ( { name, ownerId }) => {
    return await Team.create({ name , ownerId})
}

const getAllTeams = async( ) => {
    return await Team.find().populate('ownerId', 'name company')

}

const getTeamById = async ( id) =>{
    const team = await Team.findById(id).populate('ownerId', 'name company')

    if(!team) throw new ApiError.notFound("Team Not Found");

    return team 
}

const updateTeam = async(id , { name, ownerId }) => {
    const team = await Team.findByIdAndUpdate(
        id,
        { name, ownerId },
        { new:true, runValidators:true}
    ).populate('ownerId', 'name company')

    if(!team) throw new ApiError.notFound("Team Not Found");
    
    return team

}

const deleteTeam = async (id) => {
    const team = await Team.findByIdAndDelete(id)

    if(!team) throw new ApiError.notFound("Team Not Found");

    return team 
}

export { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam}