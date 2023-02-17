import { util, rest, importer } from '/blockapps-rest-plus';
import config from '/load.config';

import { getYamlFile } from '/helpers/config';
import { getCurrentEnode } from '/helpers/enodeHelper';
import { waitForAddress, waitForOwner, setSearchQueryOptions, searchOne } from '/helpers/utils'
import certificateJs from '/dapp/certificates/certificate'
import {{lower name}}Js from './{{lower name}}';
{{#each attributes}}
{{#ifeq type "references"}}
import {{lower ../name}}_{{reference}}_RefJs from './{{lower ../name}}_{{reference}}_Ref';
{{/ifeq}}
{{/each}}
import constants from '/helpers/constants';

const deploymentOption = { config, logger: console };

/** 
 * Create a new {{name}} contract on a private chain via codePtr derivation
 * @param user User token (typically an admin)
 * @param args Arguments for {{name}} contract creation
 * @param options {{name}} deployment options (found in _/config/*.config.yaml_ via _load.config.js_) 
 */
async function create{{name}}(user, args, options) {
    const getKeyResponse = await rest.getKey(user, options);
    const deploy = getYamlFile(`${config.configDirPath}/${config.deployFilename}`);
    console.log("user\n\n\n\n\n", user);
    const myCert = await certificateJs.getCertificateMe(user)


    // const enode = await getCurrentEnode() 

    const chainArgs = {
        codePtr: {
          account: `${deploy.dapp.contract.address}:${deploy.dapp.contract.appChainId}`,
            name: {{lower name}}Js.contractName,
        },
        parentChain: deploy.dapp.contract.appChainId,
        args: util.usc(args),
        members: [
            {
                orgName: myCert.organization,
                orgUnit: myCert.organizationalUnit || '',
                commonName: '',
                access: true,
              }
        ],
        balances: [
            {
                address: getKeyResponse,
                balance: 100000000000000000000000000000,
            },
            {
                address: deploy.dapp.contract.address,
                balance: 100000000000000000000000000000,
            },
            {
                address: constants.governanceAddress,
                balance: 100000000000000000000000000000,
            },
        ],
        metadata: {
            history: {{lower name}}Js.contractName,
            VM: 'SolidVM',
        },
        name: {{lower name}}Js.contractName,
        label: `{{name}}-${util.uid()}-chain`,
    };

    const contractArgs = {
        name: {{lower name}}Js.contractName,
    }

    const copyOfOptions = {
        ...options,
        history: [{{lower name}}Js.contractName],
    };
    
    let error = [];

    {{#each attributes}}
    {{#ifeq type "references"}}
    if (!chainArgs.args._{{field}}.length >= 1) {
        error.push('{{../name}} requires at least one {{reference}}');
    };
    {{/ifeq}}
    {{/each}}

    if (error.length) {
        throw new Error(error.join('\n'));
    }

    const chainId = await rest.createChain(user, chainArgs, contractArgs, copyOfOptions);
    const waitOptions = { 
        ...options, 
        chainIds: [chainId],
    }
    const response = await waitForAddress(user, { address: constants.governanceAddress, name: {{lower name}}Js.contractName }, waitOptions);
    {{#each attributes}}
    {{#ifeq type "references"}}
    await waitForOwner(user, { owner: constants.governanceAddress, name: {{lower ../name}}_{{reference}}_RefJs.contractName }, { ...options, chainIds: [chainId] })
    {{/ifeq}}
    {{/each}}

    return {{lower name}}Js.bindAddress(user, constants.governanceAddress, { ...options, chainIds: [chainId] });
}

export default {
    create{{name}},
}
