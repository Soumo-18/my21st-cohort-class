import {Router} from 'express'

import * as controller from './auth.controller.js' 

import validate from '../../common/middleware/validate.middleware.js'

import RegisterDto from './dto/register.dto.js'

const router = Router()

//when an http request POST hits /register, The Router catches it.But it doesn't
//send the req straight to the controller.It FORCES the REQ to pass
//  through validate middleware first
router.post('/register', validate(RegisterDto), controller.register)

export default router