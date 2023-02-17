import { assert } from 'blockapps-rest'
import RestStatus from "http-status-codes";
import config from '../../../load.config'
import oauthHelper from "../../../helpers/oauthHelper";
import dappJs from '../dapp'
import constants from '/helpers/constants'


const testName = 'deploy.test'
const options = { config, name: testName, logger: console }
const loadEnv = dotenv.config()

describe('E2E tests', function () {
  this.timeout(config.timeout)
  let admin
  let adminCredentials
  let dapp
  
  before(async () => {
    assert.isDefined(
        config.configDirPath,
        "configDirPath is  missing. Set in config"
    )
    assert.isDefined(
        config.deployFilename,
        "deployFilename is missing. Set in config"
    )
    assert.isDefined(
        process.env.GLOBAL_ADMIN_NAME,
        "GLOBAL_ADMIN_NAME is missing. Add it to .env file"
    )
    assert.isDefined(
        process.env.GLOBAL_ADMIN_PASSWORD,
        "GLOBAL_ADMIN_PASSWORD is missing. Add it to .env file"
    )

    adminUserName = process.env.GLOBAL_ADMIN_NAME
    adminUserPassword = process.env.GLOBAL_ADMIN_PASSWORD

    let adminUserToken
    try {
      adminUserToken = await oauthHelper.getUserToken(adminUserName, adminUserPassword)
    } catch(e) {
      console.error("ERROR: Unable to fetch the user token, check your username and password in your .env", e)
      throw e
    }
    adminCredentials = { token: adminUserToken }
    console.log("getting admin user's address:", adminUserName)
    const adminResponse = await oauthHelper.getStratoUserFromToken(adminCredentials.token)
    console.log("adminResponse", adminResponse)


    assert.strictEqual(
      adminResponse.status,
      RestStatus.OK,
      adminResponse.message
    )
    admin = {...adminResponse.user, ...adminCredentials}
   
    dapp = await dappJs.uploadDappChain(admin, options)
  })

  it('should get valid deployment state', async () => {
    const state = await dapp.getState()
    assert.isDefined(state.permissionManager)
  })
})
