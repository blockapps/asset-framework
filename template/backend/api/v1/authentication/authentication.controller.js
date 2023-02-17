import jwtDecode from 'jwt-decode'
import { oauthUtil, rest } from 'blockapps-rest'
import RestStatus from 'http-status-codes'
import config from '/load.config'

import dotenv from 'dotenv'

import oauthHelper from '/helpers/oauthHelper'
import constants from '/helpers/constants'

import dappJs from '/dapp/dapp/dapp'

const oauth = oauthUtil.init(config.nodes[0].oauth)
const options = { config }
const loadEnv = dotenv.config()
class AuthenticationController {
  static async callback(req, res, next) {
    const { code } = req.query
    const { app } = req

    let address
    let username
    let accessToken
    let refreshToken
    let accessTokenExpiration
    let adminCredentials
    let adminUserName = process.env.GLOBAL_ADMIN_NAME
    let adminUserPassword = process.env.GLOBAL_ADMIN_PASSWORD

    try {
      const tokensResponse = await oauth.getAccessTokenByAuthCode(code)
      accessToken = tokensResponse.token[
        config.nodes[0].oauth.tokenField
          ? config.nodes[0].oauth.tokenField
          : 'access_token'
      ]
      const decodedToken = jwtDecode(accessToken)
      accessTokenExpiration = decodedToken.exp
      refreshToken = tokensResponse.token.refresh_token
      username = decodedToken.preferred_username
      try {
        address = await rest.getKey({ username, token: accessToken }, options)
      } catch (e) {
        // user isn't created in STRATO
        if (e.response && e.response.status === RestStatus.BAD_REQUEST) {
          console.log('User not created in STRATO!')
          next(e) 
        }
      }
    } catch (e) {
      rest.response.status(RestStatus.FORBIDDEN, res)
      return next()
    }

    res.cookie(oauth.getCookieNameAccessToken(), accessToken, {
      maxAge: config.nodes[0].oauth.appTokenCookieMaxAge,
      httpOnly: true,
    })
    res.cookie(oauth.getCookieNameAccessTokenExpiry(), accessTokenExpiration, {
      maxAge: config.nodes[0].oauth.appTokenCookieMaxAge,
      httpOnly: true,
    })
    res.cookie(oauth.getCookieNameRefreshToken(), refreshToken, {
      maxAge: config.nodes[0].oauth.appTokenCookieMaxAge,
      httpOnly: true,
    })

    
    // check if user exists - if not, create them

    // bind to dapp as service user (to have permissions to create user if needed)
    const deploy = app.get(constants.deployParamName)
    const copyOfOptions = {
      ...options,
      chainIds: [deploy.dapp.contract.appChainId]
    }


    let adminUserToken
    try {
      adminUserToken = await oauthHelper.getUserToken(adminUserName, adminUserPassword)
      console.log("adminUserToken", adminUserToken)
    } catch(e) {
      console.error("ERROR: Unable to fetch the user token, check your username and password in your .env", e)
      return next(e)
    }
    adminCredentials = { token: adminUserToken }

    let adminResponse
    try{
      adminResponse = await oauthHelper.getStratoUserFromToken(adminCredentials.token)
    } catch(e) {
      console.error("ERROR: Unable to fetch the user from the token, check your username and password in your .env", e)
      return next(e)
    }


    console.log("adminResponse: ", adminResponse)

    let dapp
    try{
      dapp = await dappJs.bind({ token: adminUserToken }, deploy.dapp.contract, copyOfOptions)
    }
    catch(e) {
      console.error("ERROR: Unable to bind to the dapp", e)
      return next(e)
    }


    res.redirect('/')

    return true
  }

  static async logout(req, res) {
    const oauthSignOutUrl = oauth.getLogOutUrl()

    res.clearCookie(oauth.getCookieNameAccessToken())
    res.clearCookie(oauth.getCookieNameAccessTokenExpiry())
    res.clearCookie(oauth.getCookieNameRefreshToken())

    rest.response.status200(res, { logoutUrl: oauthSignOutUrl })
  }
}

export default AuthenticationController
