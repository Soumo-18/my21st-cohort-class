import * as teamService from '../services/team.service.js'

import ApiResponse from '../../../common/utils/api-response.js'


const createTeam = async (req, res) => {
    const team = await teamService.createTeam(req.body);
    ApiResponse.created(res, "Team Created Successfully", team)
}

const getAllTeams = async (req, res) => {
    const teams = await teamService.getAllTeams();
    ApiResponse.ok(res, "Teams Fetched Successfully", teams)
}

const getTeamById = async (req, res) => {
    const team = await teamService.getTeamById(req.params.id)
    ApiResponse.ok(res, "Team Fetched Successfully", team)
}

const updateTeam = async (req, res) => {
    const updatedTeam = await teamService.updateTeam(req.params.id, req.body)
    ApiResponse.ok(res, "Team Updated Successfully", updatedTeam)
}

const deleteTeam = async (req, res) => {
    await teamService.deleteTeam(req.params.id)
    ApiResponse.ok(res, "Team Deleted Successfully")
}

export { createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam } 