import RestStatus from 'http-status-codes'
import { oauthUtil, rest } from 'blockapps-rest'
import jwtDecode from 'jwt-decode'
import config from '/load.config'

const getTokenFromCookie = async (req, res) => {
  const tokenName = req.app.oauth.getCookieNameAccessToken()
  if (req.cookies[tokenName]) {
    try {
      await req.app.oauth.validateAndGetNewToken(req, res)
      return req.cookies[tokenName] // the cookie may have the updated value here after validateAndGetNewToken()
    } catch (err) {
      console.log(
        'Access token is either invalid or expired and could not been refreshed',
      )
    }
  }
  return null
}

const getTokenFromHeader = async (req) => {
  if (!req.headers.authorization) return null
  const [bearer, token] = req.headers.authorization.split(' ')
  if (bearer !== 'Bearer') return null
  return token
}

class AuthHandler {
  static authorizeRequest() {
    return async function (req, res, next) {
      try {
        let token = await getTokenFromCookie(req, res)
        let address
        if (!token) {
          token = await getTokenFromHeader(req, res)
        }
        if (token) {
          console.log('Got token')
          let decodedToken
          try {
            decodedToken = jwtDecode(token)
          } catch (err) {
            rest.response.status(
              RestStatus.BAD_REQUEST,
              res,
              'Access token is not a valid JWT',
            )
            return next()
          }
          try {
            address = await rest.getKey({ username: decodedToken.preferred_username, token }, { config })
          } catch (e) {
            // user isn't created in STRATO
            if (e.response && e.response.status === RestStatus.BAD_REQUEST) {
              console.log('User not created in STRATO!')
              next(e) 
            }
          }
          req.address = address
          req.accessToken = { token }
          req.decodedToken = decodedToken
          req.username = decodedToken.preferred_username
          console.log('Authorization success, moving on...')
          return next()
        }
      } catch (err) {
        rest.response.status(RestStatus.INTERNAL_SERVER_ERROR)
        return next()
      }

      rest.response.status(RestStatus.UNAUTHORIZED, res, {
        loginUrl: req.app.oauth.getSigninURL(),
      })
      return next()
    }
  }

  static initOauth() {
    let oauth
    try {
      oauth = oauthUtil.init(config.nodes[0].oauth)
    } catch (err) {
      console.log('Error initializing oauth handlers')
      process.exit(1)
    }
    return oauth
  }
}

export default AuthHandler
