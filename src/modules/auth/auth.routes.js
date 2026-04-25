import {Router} from 'express'

import * as controller from './auth.controller.js' 

import validate from '../../common/middleware/validate.middleware.js'

import RegisterDto from './dto/register.dto.js'
import LoginDto from './dto/login.dto.js'
import ForgotPasswordDto from './dto/forgot-password.dto.js'
import ResetPasswordDto from './dto/reset_password.dto.js'
import { authenticate } from './auth.middleware.js'
import { updateOwner } from '../ipl-ms/services/owner.service.js'
import { upload } from '../../common/middleware/multer.middleware.js'
import { uploadAvatar } from './auth.controller.js'
const router = Router()

//when an http request POST hits /register, The Router catches it.But it doesn't
//send the req straight to the controller.It FORCES the REQ to pass
//  through validate middleware first
router.post('/register', validate(RegisterDto), controller.register)

router.post("/login", validate(LoginDto),controller.login)

router.post('./refresh-token', controller.refreshToken)
router.post('/logout', authenticate, controller.logout)

router.post('/verify-email/:token',controller.verifyEmail)

router.post('/forgot-password',validate(ForgotPasswordDto),controller.forgotPassword)

router.put('/reset-password', validate(ResetPasswordDto), controller.resetPassword)

router.get('/me', authenticate, controller.getMe)

router.post('/avatar', authenticate, upload.single('avatar'), controller.uploadAvatar)

export default router