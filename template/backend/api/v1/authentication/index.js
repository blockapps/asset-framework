import express from 'express'
import AuthenticationController from './authentication.controller'
import authHandler from '../../middleware/authHandler'

const router = express.Router()

router.get(
  '/callback',
  AuthenticationController.callback,
)

router.get(
  '/logout',
  authHandler.authorizeRequest(),
  AuthenticationController.logout,
)

export default router
