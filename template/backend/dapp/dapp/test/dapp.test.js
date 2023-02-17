import { assert, fsUtil, util } from 'blockapps-rest'
import RestStatus from "http-status-codes";
import config from '../../../load.config'
import oauthHelper from "../../../helpers/oauthHelper";
import dappJs from '../dapp'
import constants from '/helpers/constants'


const testName = 'deploy.test'

const options = { config, name: testName, logger: console }

describe('Dapp Deployment tests', function () {
  this.timeout(config.timeout)

  const testDeployFilePath = `${config.configDirPath}/testdeploy.${util.uid()}.yaml`
  let admin
  let adminCredentials
  
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
    
    let adminUserName = process.env.GLOBAL_ADMIN_NAME
    let adminUserPassword = process.env.GLOBAL_ADMIN_PASSWORD

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
   

  })

  it('should upload dapp contracts', async () => {
    const dapp = await dappJs.uploadDappChain(admin, options)
    assert.isDefined(dapp.chainId)
  })

  it('should deploy dapp - write deploy.yaml', async () => {
    const dapp = await dappJs.uploadDappChain(admin, options)
    const args = { deployFilePath: testDeployFilePath, applicationUser: admin }

    const deployment = await dapp.deploy(args)
    assert.isDefined(deployment.dapp.contract)
    assert.isDefined(deployment.dapp.contract.address)
    assert.equal(deployment.dapp.contract.address, dapp.address)
  })

  it('should load dapp from deployment', async () => {
    {
      const dapp = await dappJs.uploadDappChain(admin, options)
      const args = { deployFilePath: testDeployFilePath, applicationUser: admin }
      const deployment = await dapp.deploy(args)
      assert.isDefined(deployment.dapp.contract)
    }

    const deployment = fsUtil.getYaml(testDeployFilePath)
    const dapp = await dappJs.bind(admin, deployment.dapp.contract, {
      chainIds: [deployment.dapp.contract.appChainId],
      ...options
    })

    const { permissionManager } = await dapp.getState()
    assert.isDefined(permissionManager)
  })
})
