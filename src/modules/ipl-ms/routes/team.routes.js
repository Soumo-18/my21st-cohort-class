import { Router } from "express";

import * as controller from '../controllers/team.controller.js'

import validate from '../../../common/middleware/validate.middleware.js'

import { CreateTeamDto , UpdateTeamDto } from '../dto/team.dto.js'

const router = Router()

router.post('/', validate(CreateTeamDto), controller.createTeam )

router.get('/', controller.getAllTeams)

router.get('/:id', controller.getTeamById)

router.put('/:id', validate(UpdateTeamDto), controller.updateTeam)


router.delete('/:id', controller.deleteTeam)





export default router