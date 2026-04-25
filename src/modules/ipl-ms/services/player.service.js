
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

