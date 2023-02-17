import { assert } from 'chai'
import config from "../../load.config"
import oauthHelper from "../../helpers/oauthHelper"
import { getMembershipStates } from '/helpers/enums'
import RestStatus from "http-status-codes"


import dappJs from "./dapp"


const options = { config, logger: console }

describe("{{name}} Dapp - deploy secondary org", function() {
  this.timeout(config.timeout)
  
  let MembershipStates

  let adminCredentials
  let adminUser

  let dapp
  let orgCert
  let orgAddress
  let orgPubKey // I hate you

  let appPermissionManager
  let organizationManager
  let membershipManager
  let userManager
  

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
        config.orgDeployFilename,
        "orgDeployFilename is missing. Set in config"
    )
    

    let serviceUserToken
    try {
      serviceUserToken = await oauthHelper.getServiceToken()
    } catch(e) {
      console.error("ERROR: Unable to fetch the service user token, check your OAuth settings in config", e)
      throw e
    }
    adminCredentials = { token: serviceUserToken }
    const adminEmail = oauthHelper.getEmailIdFromToken(adminCredentials.token)
    console.log("Creating admin", adminEmail)
    const adminResponse = await oauthHelper.createStratoUser(
      adminCredentials,
      adminEmail
    )
    assert.strictEqual(
      adminResponse.status,
      RestStatus.OK,
      adminResponse.message
    )
    adminUser = adminResponse.user
  })

  it('Load app from deploy file', async () => {
    dapp = await dappJs.loadFromDeployment(adminUser, `${config.configDirPath}/${config.deployFilename}`, options)
  })



  /*
  it.skip('Apply for membership to app and wait for approval', async () => {
    const enodeAddress = await getCurrentEnode()
    const requestArgs = {
      orgCert,
      enodeAddress,
    }

    const membership = await dapp.requestMembership(requestArgs)

    // spin baby, spin!
    const status = new Spinner(
      'Membership request pending, please wait...',
    )

    status.start()
    const result = await membership.waitTillProcessed() // global admin needs to approve
    status.stop()


    // write org deploy file
    const orgDeployFilePath = `${config.configDirPath}/${config.orgDeployFilename}`
    console.log(`Writing org info to ${orgDeployFilePath}`)
    
    const deployment = {
      url: config.nodes[0].url,
      orgAddress,
      orgPubKey,
    }
    yamlWrite(deployment, orgDeployFilePath)
  })
  */
})
