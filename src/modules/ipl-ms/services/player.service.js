
//create read update delete
//how to transfer a player
import ApiError from '../../../common/utils/api-error.js'
import Player from '../models/player.model.js'
import Team from '../models/team.model.js'
const transferPlayer = async(playerId, newTeamId) => {
    const team = await Team.findById(newTeamId)  //whether this newTeamId exists or not 
    if (!team) {
        throw new ApiError.notFound("Team NOT Found")
    }
    const player = await Player.findByIdAndUpdate(
        playerId,
        { teamId: newTeamId },
        { new:true, runValidators:true }
    ).populate( "teamId", "name")       //ref to new teamid

    if(!player) throw new ApiError.notFound("Player NOT Found");

    return player;
}

const getPlayerByTeam = async (teamId) => {
    return await Player.find({ teamId }).populate('teamId', 'name')
}

const updatePlayerRole = async (playerId, newRole) => {
    const player = await Player.findByIdAndUpdate(
        playerId,
        { role: newRole },
        { new: true, runValidators: true }
    ).populate('teamId', 'name')
    
    if (!player) throw new ApiError.notFound("Player Not Found");
    return player
}

const createPlayer = async ({ name, role, teamId }) => {
    return await Player.create({ name, role, teamId })
}

const getAllPlayers = async () => {
    return await Player.find().populate('teamId', 'name')
}

const getPlayerById = async (id) => {
    const player = await Player.findById(id).populate('teamId', 'name')
    if (!player) throw new ApiError.notFound("Player Not Found");
    return player
}

const updatePlayer = async (id, { name, role, teamId }) => {
    const player = await Player.findByIdAndUpdate(
        id, 
        { name, role, teamId }, 
        { new: true, runValidators: true }
    ).populate('teamId', 'name')
    
    if (!player) throw new ApiError.notFound("Player Not Found");
    return player
}

const deletePlayer = async (id) => {
    const player = await Player.findByIdAndDelete(id)
    if (!player) throw new ApiError.notFound("Player Not Found");
    return player
}


export { 
    createPlayer, getAllPlayers, 
    getPlayerById, updatePlayer,
     deletePlayer, transferPlayer,
     getPlayerByTeam, updatePlayerRole 
}