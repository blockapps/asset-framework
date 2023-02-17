import { assert } from 'chai'
import { rest } from 'blockapps-rest'
import config from "../../load.config"
import oauthHelper from "../../helpers/oauthHelper"
import { getYamlFile, yamlWrite } from '/helpers/config'
import RestStatus from "http-status-codes"
import dotenv from 'dotenv'

import dappJs from "./dapp"

{{#each assets}}
import {{lower name}}Js from '/dapp/assets/{{name}}/{{lower name}}'
{{/each}}

const options = { config, logger: console }
const loadEnv = dotenv.config()


describe("{{name}} Dapp - deploy contracts, bootnode organization", function() {
  this.timeout(config.timeout)

  let adminCredentials
  let adminUser

  let dapp

  let appChainID
  
  let adminUserName
  let adminUserPassword


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

    assert.strictEqual(
      adminResponse.status,
      RestStatus.OK,
      adminResponse.message
    )
    adminUser = {...adminResponse.user, ...adminCredentials}

  })


  it('Deploy Dapp and Add Bootmembers', async () => {
    let members = []
    if (config.bootMembersFilename) {
      const fileContents = getYamlFile(`./${config.configDirPath}/${config.bootMembersFilename}`)

      members = fileContents ? fileContents.members.map((mem) => {
        return {
          orgName: mem.organization ? mem.organization : '',
          orgUnit: mem.unit ? mem.unit : '',
          commonName: mem.commonName ? mem.commonName : '',
          access: true,
        }
      }): [{}]
    }

    
    // temporary - to force proper table namespacing
    const mainChainContract = await dappJs.uploadMainChainContract(adminUser, options)
    
    dapp = await dappJs.uploadDappChain(adminUser, mainChainContract.address, members, options)
    
    assert.isDefined(dapp.chainId)
    
    const deployArgs = { deployFilePath: `${config.configDirPath}/${config.deployFilename}` }
    const deployment = dapp.deploy(deployArgs)
    assert.isDefined(deployment)
    assert.equal(deployment.dapp.contract.address, dapp.address)
    assert.isDefined(deployment.dapp.contract.appChainId)
    appChainID = deployment.dapp.contract.appChainId
  })


})
