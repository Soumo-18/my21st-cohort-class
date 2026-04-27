import * as playerService from '../services/player.service.js'

import ApiResponse from '../../../common/utils/api-response.js'


const createPlayer = async (req,res) => {
    const player = await playerService.createPlayer(req.body)
    ApiResponse.created(res, "Player Created Successfully", player)
}

const getAllPlayers = async ( req,res) => {
    const players = await playerService.getAllPlayers()
    ApiResponse.ok(res, "All Players Fetched Successfully", players)
}

const getPlayerById = async ( req,res ) => {
    const player = await playerService.getPlayerById(req.params.id)
    ApiResponse.ok(res, 'Player Fetched Successfully', player)
}

const updatePlayer = async (req,res) => {
    const updatedPlayer = await playerService.updatePlayer(req.params.id, req.nody)
    ApiResponse.ok(res, 'Player Updated Successfully', updatedPlayer)
}

const deletePlayer = async (req,res) => {
    
    await player.deletePlayer(req.params.id)
    ApiResponse.ok(res, 'Player Deleted Successfully')
}

const transferPlayer = async(req,res) => {
    const player = await playerService.transferPlayer(req.params.id, req.body.newTeamId)
    ApiResponse.ok(res, "Player Transferred Successfully", player)

}

const getPlayerByTeam = async (req, res) => {
    const players = await playerService.getPlayerByTeam(req.params.teamId)
    ApiResponse.ok(res, "Team Players Fetched Successfully", players)
}

const updatePlayerRole = async (req, res) => {
    const player = await playerService.updatePlayerRole(req.params.id, req.body.role)
    ApiResponse.ok(res, "Player Role Updated Successfully", player)
}

export {
    updatePlayerRole, getPlayerByTeam, transferPlayer,
    createPlayer, getAllPlayers, getPlayerById,
    updatePlayer, deletePlayer
}