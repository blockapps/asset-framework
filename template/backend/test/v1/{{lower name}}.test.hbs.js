import { assert, rest } from 'blockapps-rest'
import { util } from '/blockapps-rest-plus'
import dotenv from 'dotenv'
import config from '../../load.config'
import constants from '/helpers/constants'
import oauthHelper from '/helpers/oauthHelper'
import { get, post, put } from '/helpers/rest'


import { {{lower name}}Args, update{{name}}Args } from './factories/{{lower name}}'
import { {{name}}, Organizations } from '../../api/v1/endpoints'

const options = { config }

const loadEnv = dotenv.config()
assert.isUndefined(loadEnv.error)

describe('{{name}} End-To-End Tests', function () {
  this.timeout(config.timeout)
  let orgAdmin

  before(async () => {
    let orgAdminToken
    try {
      orgAdminToken = await oauthHelper.getUserToken(
        `${process.env.GLOBAL_ADMIN_NAME}`,
        `${process.env.TEST_USER_PASSWORD}`,
      )
    } catch (e) {
      console.error(
        'ERROR: Unable to fetch the org user token, check your OAuth settings in config',
        e,
      )
      throw e
    }

    const orgAdminCredentials = { token: orgAdminToken }

    const orgAdminResponse = await oauthHelper.getStratoUserFromToken(orgAdminCredentials.token)
    console.log("adminResponse", orgAdminResponse)


    assert.strictEqual(
      orgAdminResponse.status,
      RestStatus.OK,
      orgAdminResponse.message
    )
    orgAdmin = {...orgAdminResponse.user, ...orgAdminCredentials}



  })

  it('Create a {{name}}', async () => {
    const createArgs = {
      ...{{lower name}}Args(util.uid()),
    }

    const createResponse = await post(
      {{name}}.prefix,
      {{name}}.create,
      createArgs,
      orgAdmin.token,
    )

    assert.equal(createResponse.status, 200, 'should be 200');
    assert.isDefined(createResponse.body, 'body should be defined')
  })

  it('Get a {{name}}', async () => {
    // create
    const createArgs = {
      ...{{lower name}}Args(util.uid()),
    }

    const createResponse = await post(
      {{name}}.prefix,
      {{name}}.create,
      createArgs,
      orgAdmin.token,
    )

    assert.equal(createResponse.status, 200, 'should be 200');
    assert.isDefined(createResponse.body, 'body should be defined')

    // get
    const getMachine = await get(
      {{name}}.prefix,
      {{name}}.get.replace(':address', createResponse.body.data.address).replace(':chainId', createResponse.body.data.chainIds[0]),
      {},
      orgAdmin.token,
    )
      
    assert.equal(getMachine.status, 200, 'should be 200');
    assert.isDefined(getMachine.body, 'body should be defined');
    
    {{#each attributes}}
      assert.equal(getMachine['{{field}}'], createArgs['{{field}}'], '{{field}} should be equal');
    {{/each}}
  })

  it('Get all {{name}}', async () => {
    // get
    const getMachine = await get(
      {{name}}.prefix,
      {{name}}.getAll,
      {},
      orgAdmin.token,
    )

    assert.equal(getMachine.status, 200, 'should be 200');
    assert.isDefined(getMachine.body, 'body should be defined');
    assert.isDefined(getMachine.body.data, 'body should be defined');
  })

  it('update {{name}}', async () => {
    // create
    const createArgs = {
      ...{{lower name}}Args(util.uid()),
    }

    const createResponse = await post(
      {{name}}.prefix,
      {{name}}.create,
      createArgs,
      orgAdmin.token,
    )

    assert.equal(createResponse.status, 200, 'should be 200');
    assert.isDefined(createResponse.body, 'body should be defined')

    const updateArgs = {
      ...update{{name}}Args(createResponse.body.data.address, createResponse.body.data.chainIds[0], util.uid()),
    }

    // get
    const getMachine = await put(
      {{name}}.prefix,
      {{name}}.update,
      updateArgs,
      orgAdmin.token,
    )

    assert.equal(getMachine.status, 200, 'should be 200');
    assert.isDefined(getMachine.body, 'body should be defined');
    assert.equal(getMachine.machine_ID, createArgs.machine_ID, 'machine Id should be equal');
    assert.equal(getMachine.purpose, createArgs.purpose, 'purpose should be defined');
    assert.equal(getMachine.model, createArgs.model, 'model should be defined');
    assert.equal(getMachine.installation_Date, createArgs.installation_Date, 'installation_Date should be defined');
  })

  it('audit {{name}}', async () => {

    // create
    const createArgs = {
      ...{{lower name}}Args(util.uid()),
    }

    const createResponse = await post(
      {{name}}.prefix,
      {{name}}.create,
      createArgs,
      orgAdmin.token,
    )

    console.log(createResponse.body);

    assert.equal(createResponse.status, 200, 'should be 200');
    assert.isDefined(createResponse.body, 'body should be defined')


    // get
    const getMachine = await get(
      {{name}}.prefix,
      {{name}}.audit.replace(':address', createResponse.body.data.address).replace(':chainId', createResponse.body.data.chainIds[0]),
      {},
      orgAdmin.token,
    )
      
    assert.equal(getMachine.status, 200, 'should be 200');
    assert.isDefined(getMachine.body, 'body should be defined');
    assert.isAtLeast(getMachine.body.data.length, 1, 'should be equal and greater');
  })

  it('transfer ownership', async () => {

    // create
    const createArgs = {
      ...{{lower name}}Args(util.uid()),
    }

    const createResponse = await post(
      {{name}}.prefix,
      {{name}}.create,
      createArgs,
      orgAdmin.token,
    )

    console.log(createResponse.body);

    assert.equal(createResponse.status, 200, 'should be 200');
    assert.isDefined(createResponse.body, 'body should be defined')

    // fetch Orgs
    const fetchResponse = await get(
      Organizations.prefix,
      Organizations.getAll,
      {},
      orgAdmin.token,
    )

    assert.equal(fetchResponse.status, 200, 'should be 200');
    assert.isDefined(fetchResponse.body, 'body should be defined')


    const transferArgs = {
      address: createResponse.body.data.address,
      chainId: createResponse.body.data.chainIds[0],
      newOwner: fetchResponse.body.data[0].address
    }

    // get
    const getTransfer = await post(
      {{name}}.prefix,
      {{name}}.transferOwnership,
      transferArgs,
      orgAdmin.token,
    )
      
    assert.equal(getTransfer.status, 200, 'should be 200');
  })
})
