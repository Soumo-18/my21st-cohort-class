import { Router } from "express";

import * as controller from '../controllers/player.controller.js'

import validate from "../../../common/middleware/validate.middleware.js";

import { CreatePlayerDto, UpdatePlayerDto, TransferPlayerDto, UpdatePlayerRoleDto } from "../dto/player.dto.js";
import router from "./owner.routes";

const router = Router()

router.post('/', validate(CreatePlayerDto), controller.createPlayer)

router.get('/', controller.getAllPlayers)

router.get('/:id', controller.getPlayerById)

router.put('/:id', validate(UpdatePlayerDto), controller.updatePlayer)

router.delete('/:id', controller.deletePlayer)

//patch for updating a specific field
router.patch('/:id/transfer', validate(TransferPlayerDto), controller.transferPlayer)

router.get('/team/:teamId', controller.getPlayerByTeam)

router.patch('/:id/role', validate(UpdatePlayerRoleDto), controller.updatePlayerRole)


export default router 