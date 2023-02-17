import * as R from 'ramda';
import { rest, util, assert } from '/blockapps-rest-plus';
import config from '/load.config';
import oauthHelper from '/helpers/oauthHelper';
import dotenv from 'dotenv';
import constants from '/helpers/constants';

import RestStatus from 'http-status-codes';

import appPermissionManagerJs from '/dapp/permissions/app/appPermissionManager';
import {{lower name}}Js from '../{{lower name}}';
import {{lower name}}ChainJs from '../{{lower name}}Chain';
import factory from './{{lower name}}.factory.js';
import user from '/dapp/users/user.js';
import { args } from 'commander';

const options = { config };

const loadEnv = dotenv.config();
assert.isUndefined(loadEnv.error);

/**
 * Test out functionality of {{name}}
 */
describe('{{name}}', function() {
    this.timeout(config.timeout);

    let globalAdmin;
    let contract;

    const member = () => `${util.uid() + 1}`.padStart(40, '0'); // Generate address
    const enode = () => 'enode://' + `${util.uid() + 1}`.padStart(130, '0') + '@1.2.3.4:30303';
    const factoryArgs = (user) => ({ ...(factory.get{{name}}Args(util.uid())), assetOwner: user.address});

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


    });

    it('Create {{name}} - 201', async () => {
        // Create {{name}} via upload
        const args = factoryArgs(globalAdmin)
        contract = await {{lower name}}Js.uploadContract(globalAdmin, args, options);
        const state = await contract.getState();

        assert.notStrictEqual(
            { ...state, constructor: '' },  // Ignore constructor
            { ...args, owner: globalAdmin.address, constructor: '' });
    });

    it('addMember - 200', async () => {
        const res = await contract.addMember(member(), enode());
        assert.equal(res[0], RestStatus.OK);
    });

    it('removeMember - 200', async () => {
        const res = await contract.removeMember(member());
        assert.equal(res[0], RestStatus.OK);
    });

    it('addMembers - 200', async () => {
        const res = await contract.addMembers([member(), member(), member()], [enode(), enode(), enode()]);
        assert.equal(res[0], RestStatus.OK);
    });

    it('removeMembers - 200', async () => {
        const res = await contract.removeMembers([member(), member(), member()]);
        assert.equal(res[0], RestStatus.OK);
    });

    it('create{{name}} (Private chain)', async () => {
        const args = factoryArgs(globalAdmin);
        const {{lower name}} = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args, options);
        const {{lower name}}Data = await {{lower name}}.get();
        // Sorting is needed in order to allow for chainIds to be in any order
        {{#each attributes}}
        {{#ifeq type 'references'}}
        {{lower ../name}}Data.{{field}}.sort();
        args.{{field}}.sort();
        {{/ifeq}}
        {{/each}}
        // Convert all fields into a string to allow for equality checking
        assert.deepInclude(
            // Convert the {{name}} data into strings as the args are in strings
            R.map(v => '' + v, {{lower name}}Data),
            R.map(v => '' + v, args));
    });

    it('create{{name}} (Private chain, multiple)', async () => {
        const args1 = factoryArgs(globalAdmin);
        const args2 = factoryArgs(globalAdmin);
        const args3 = factoryArgs(globalAdmin);
        const args4 = factoryArgs(globalAdmin);
        const {{lower name}}1 = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args1, options);
        const {{lower name}}2 = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args2, options);
        const {{lower name}}3 = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args3, options);
        const {{lower name}}4 = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args4, options);
        const {{lower name}}Data1 = await {{lower name}}1.get();
        const {{lower name}}Data2 = await {{lower name}}2.get();
        const {{lower name}}Data3 = await {{lower name}}3.get();
        const {{lower name}}Data4 = await {{lower name}}4.get();
        {{#each attributes}}
        {{#ifeq type 'references'}}
        // Sorting is needed in order to allow for chainIds to be in any order
        {{lower ../name}}Data1.{{field}}.sort();
        {{lower ../name}}Data2.{{field}}.sort();
        {{lower ../name}}Data3.{{field}}.sort();
        {{lower ../name}}Data4.{{field}}.sort();
        args1.{{field}}.sort();
        args2.{{field}}.sort();
        args3.{{field}}.sort();
        args4.{{field}}.sort();
        {{/ifeq}}
        {{/each}}
        // Our logic shouldn't mix up {{lower name}}s
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data1), R.map(v => '' + v, args1));
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data2), R.map(v => '' + v, args2));
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data3), R.map(v => '' + v, args3));
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data4), R.map(v => '' + v, args4));    
    });

    // it('Create an organization manager', async () => {
    //     // Create App Permission Manager
    //     const appPermissionManagerContract = await appPermissionManagerJs.uploadContract(globalAdmin, {
    //         admin: globalAdmin.address,
    //         master: globalAdmin.address,
    //     }, options);
      
    //     // assign role
    //     await appPermissionManagerContract.grantGlobalAdminRole({ user: globalAdmin });
  
    //     // Create Organization Manager
    //     const organizationManager = await organizationManagerJs.uploadContract(globalAdmin,
    //         { permissionManager: appPermissionManagerContract.address }, options);
  
    //     assert.notEqual(organizationManager.address, constants.zeroAddress, 'Contract address must be not zero');
  
    //     const { permissionManager, owner } = await organizationManager.getState();
    //     assert.equal(owner, globalAdmin.address, 'owner');
    //     assert.equal(permissionManager, appPermissionManagerContract.address, 'permissionManager');
    // });

    it('Create and transfer ownership of a {{name}}', async () => {
        // Create our {{name}}
        const args = factoryArgs(globalAdmin);
        const {{lower name}} = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args, options);
  
        // Check if {{name}} was created
        const {{lower name}}Data = await {{lower name}}.get();
        {{#each attributes}}
        {{#ifeq type 'references'}}
        {{lower ../name}}Data.{{field}}.sort();
        args.{{field}}.sort();
        {{/ifeq}}
        {{/each}}
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data), R.map(v => '' + v, args));
  
        // Create App Permission Manager
        const appPermissionManagerContract = await appPermissionManagerJs.uploadContract(globalAdmin, {
            admin: globalAdmin.address,
            master: globalAdmin.address,
        }, options);
      
        // assign role
        await appPermissionManagerContract.grantGlobalAdminRole({ user: globalAdmin });

        let addrToBeTransferedTo = 0x0 // TODO FILL THIS IN


        const {{lower name}}Response = await {{lower name}}.transferOwnership(addrToBeTransferedTo);
        assert.equal({{lower name}}Response, RestStatus.OK)
    });

    it('Create and update a {{name}}', async () => {
        // Create our {{name}}
        const args = factoryArgs(globalAdmin);
        const {{lower name}} = await {{lower name}}ChainJs.create{{name}}(globalAdmin, args, options);
  
        // Check if {{name}} was created
        const {{lower name}}Data = await {{lower name}}.get();
        {{#each attributes}}
        {{#ifeq type 'references'}}
        {{lower ../name}}Data.{{field}}.sort();
        args.{{field}}.sort();
        {{/ifeq}}
        {{/each}}
        assert.deepInclude(R.map(v => '' + v, {{lower name}}Data), R.map(v => '' + v, args));
        
        
        const args2 = factoryArgs(globalAdmin);
        const update = await {{lower name}}.update(args2)
        assert.equal(update[0], RestStatus.OK)
    });
});