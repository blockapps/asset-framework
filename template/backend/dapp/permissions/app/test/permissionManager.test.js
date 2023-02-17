import { rest, assert } from 'blockapps-rest'
import dotenv from 'dotenv'
import config from '/load.config'
import oauthHelper from '/helpers/oauthHelper'
import permissionManager from '../appPermissionManager'
import constants from '/helpers/constants'

const options = { config }

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

describe('App Chain Permission Manager', function () {
  this.timeout(config.timeout)

  let globalAdmin
  let orgAdmin
  let contract

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
    let adminCredentials = { token: adminUserToken }
    console.log("getting admin user's address:", adminUserName)
    const adminResponse = await oauthHelper.getStratoUserFromToken(adminCredentials.token)
    console.log("adminResponse", adminResponse)


    assert.strictEqual(
      adminResponse.status,
      RestStatus.OK,
      adminResponse.message
    )
    globalAdmin = {...adminResponse.user, ...adminCredentials}

    const args = {
      admin: globalAdmin.address,
      master: globalAdmin.address,
    }
    contract = await permissionManager.uploadContract(globalAdmin, args, options)
    await contract.grantGlobalAdminRole({ user: globalAdmin })


    let orgAdminToken
    try {
      orgAdminToken = await oauthHelper.getUserToken(`${process.env.ORGANIZATION_ADMIN_NAME}`, `${process.env.TEST_USER_PASSWORD}`)
    } catch (e) {
      console.error('ERROR: Unable to fetch the org admin token, check your OAuth settings in config', e)
      throw e
    }
    const orgAdminCredentials = { token: orgAdminToken }
    const orgAdminResponse = await oauthHelper.getStratoUserFromToken(orgAdminCredentials.token)

    assert.strictEqual(
        orgAdminResponse.status,
        RestStatus.OK,
        orgAdminResponse.message
    )
    orgAdmin = {...orgAdminResponse.user, ...orgAdminCredentials}

    await contract.grantOrganizationAdminRole({ user: orgAdmin })
  })

  describe('Global Admin role', () => {

    it(`Global Admin can modifyMembership`, async () => {
      const isPermitted = await contract.canModifyMembership(globalAdmin)

      assert.equal(
        isPermitted,
        true,
        `Global Admin should be able to modify memberships`,
      )
    })

    it(`Global Admin can createOrganization`, async () => {
      const isPermitted = await contract.canCreateOrganization(globalAdmin)

      assert.equal(
        isPermitted,
        true,
        `Global Admin should be able to create organization`,
      )
    })

    it(`Global Admin can createUser`, async () => {
      const isPermitted = await contract.canCreateUser(globalAdmin)

      assert.equal(
        isPermitted,
        true,
        `Global Admin should be able to create user`,
      )
    })

    it(`Global Admin can updateUser`, async () => {
      const isPermitted = await contract.canUpdateUser(globalAdmin)

      assert.equal(
        isPermitted,
        true,
        `Global Admin should be able to update user`,
      )
    })
  })

  describe('Organization Admin role', () => {

    it(`Org Admin can updateOrganization`, async () => {
      const isPermitted = await contract.canUpdateOrganization(orgAdmin)

      assert.equal(
        isPermitted,
        true,
        `Org Admin should be able to update organization`,
      )
    })

    it(`Org Admin can createUser`, async () => {
      const isPermitted = await contract.canCreateUser(orgAdmin)

      assert.equal(
        isPermitted,
        true,
        `Org Admin should be able to create user`,
      )
    })

    it(`Org Admin can updateUser`, async () => {
      const isPermitted = await contract.canUpdateUser(orgAdmin)

      assert.equal(
        isPermitted,
        true,
        `Org Admin should be able to update user`,
      )
    })
  })
})
