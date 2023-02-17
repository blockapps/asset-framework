import { rest, oauthUtil } from 'blockapps-rest'
import RestStatus from 'http-status-codes'
import jwtDecode from 'jwt-decode'
import config from '/load.config'
import constants from './constants'
import axios from 'axios';

const options = { config }
const KEY_ENDPOINT = "/strato/v2.3/key";


const CACHED_DATA = {
  serviceToken: null,
  serviceTokenExpiresAt: null,
}


async function getStratoUserFromToken(accessToken) {
  const url = `${config.nodes[0].url}${KEY_ENDPOINT}`;
  try{
    const user = await axios
      .get(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
    return { status: RestStatus.OK, message: 'success', user:user.data }
    } catch (e) {
      return {
        // eslint-disable-next-line no-nested-ternary
        status: e.response
          ? e.response.status
          : e.code
            ? e.code
            : 'NO_CONNECTION',
        message: 'error while getting user - do they exist yet? (has their key been created yet?)',
      }
    }
}


const getEmailIdFromToken = function (accessToken) {
  return jwtDecode(accessToken).email
}

async function createStratoUser(accessToken) {
  try {
    const user = await rest.createUser(accessToken, options)
    return { status: RestStatus.OK, message: 'success', user }
  } catch (e) {
    return {
      // eslint-disable-next-line no-nested-ternary
      status: e.response
        ? e.response.status
        : e.code
          ? e.code
          : 'NO_CONNECTION',
      message: 'error while creating user',
    }
  }
}

const getUsernameFromDecodedToken = (decodedToken) => {
  const {
    tokenUsernameProperty,
    tokenUsernamePropertyServiceFlow,
  } = config.nodes[0].oauth
  let username
  if (decodedToken[tokenUsernameProperty]) {
    username = decodedToken[tokenUsernameProperty]
  } else if (decodedToken[tokenUsernamePropertyServiceFlow]) {
    username = decodedToken[tokenUsernamePropertyServiceFlow]
  } else {
    username = decodedToken.preferred_username
  }
	return username
}

const getCredentialsFromToken = (token) => {
  const username = getUsernameFromDecodedToken(jwtDecode(token))
  return { username, token }
}

const getCredentialsFromTokenEnv = (envVariable) => {
  const token = process.env[envVariable]
  if (!token) throw new Error(`Env variable ${envVariable} is not set`)
  return getCredentialsFromToken(token)
}

const getServiceToken = async () => {
  const oauth = await oauthUtil.init(config.nodes[0].oauth)
  let token = CACHED_DATA.serviceToken
  const expiresAt = CACHED_DATA.serviceTokenExpiresAt
  if (
    !token
    || !expiresAt
    || expiresAt
      <= Math.floor(Date.now() / 1000)
        + constants.tokenLifetimeReserveSeconds
  ) {
    const tokenObj = await oauth.getAccessTokenByClientSecret()
    token = tokenObj.token[
      config.nodes[0].oauth.tokenField
        ? config.nodes[0].oauth.tokenField
        : 'access_token'
    ]
    CACHED_DATA.serviceToken = token
    CACHED_DATA.serviceTokenExpiresAt = Math.floor(
      tokenObj.token.expires_at / 1000,
    )
  }
  return token
}

const getUserToken = async (username, password) => {
  const oauth = await oauthUtil.init(config.nodes[0].oauth)
  const userTokenData = CACHED_DATA[`${username}`]
  
  if (
    userTokenData
    && userTokenData.token
    && userTokenData.expiresAt
    && userTokenData.expiresAt
      > Math.floor(Date.now() / 1000)
        + constants.tokenLifetimeReserveSeconds
  ) {
    console.log('returning cached token')
    return userTokenData.token
  }
  const tokenObj = await oauth.getAccessTokenByResourceOwnerCredential(
    username,
    password,
  )
  const token = tokenObj.token[
    config.nodes[0].oauth.tokenField
      ? config.nodes[0].oauth.tokenField
      : 'access_token'
  ]
  CACHED_DATA[`${username}`] = {
    token,
    expiresAt: Math.floor(tokenObj.token.expires_at / 1000),
  }
  console.log('returning new token')
  return token
}

export default {
  getEmailIdFromToken,
  createStratoUser,
  getCredentialsFromToken,
  getUsernameFromDecodedToken,
  getCredentialsFromTokenEnv,
  getServiceToken,
  getUserToken,
  getStratoUserFromToken,
}
