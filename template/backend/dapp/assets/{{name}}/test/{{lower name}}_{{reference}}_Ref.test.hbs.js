import { rest, util, assert } from '/blockapps-rest-plus';
import config from '/load.config';
import oauthHelper from '/helpers/oauthHelper';
import dotenv from 'dotenv';
import constants from '/helpers/constants';


import {{lower name}}_{{reference}}_RefJs from '../{{lower name}}_{{reference}}_Ref';
import factory from './{{lower name}}_{{reference}}_Ref.factory.js';

const options = { config };

const loadEnv = dotenv.config();
assert.isUndefined(loadEnv.error);

/**
 * Test out functionality of {{name}} {{name}}-{{reference}} reference
 */
describe('{{name}}_{{reference}}_Ref', function() {
    this.timeout(config.timeout);

    let globalAdmin;
    let {{lower name}}_{{reference}}_RefArgs;
    let contract;

    const factoryArgs = () => ({ ...(factory.get{{name}}_{{reference}}_RefArgs(util.uid())), });

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


        {{lower name}}_{{reference}}_RefArgs = factoryArgs();
        contract = await {{lower name}}_{{reference}}_RefJs.uploadContract(globalAdmin, {{lower name}}_{{reference}}_RefArgs, options);
    });

    it('Create {{name}}_{{reference}}_Ref - 201', async () => {
        const state = await contract.getState();

        assert.notStrictEqual(
            { ...state, constructor: '' },  // Ignore constructor
            { ...{{lower name}}_{{reference}}_RefArgs, owner: globalAdmin.address, constructor: '' });
    });

    it('get', async () => {
        const state = await contract.get();
        assert.include(state, {{lower name}}_{{reference}}_RefArgs);
    });
});