import { util, rest, importer } from '/blockapps-rest-plus';
import config from '/load.config';
import RestStatus from 'http-status-codes';
import { setSearchQueryOptions, searchOne, searchAll, searchAllWithQueryArgsLike, setSearchQueryOptionsPrime } from '/helpers/utils';
import dayjs from 'dayjs';

{{#each attributes}}
{{#ifeq type "references"}}
import {{lower ../name}}_{{reference}}_Ref from "./{{lower ../name}}_{{reference}}_Ref";
{{/ifeq}}
{{/each}}

const contractName = '{{name}}';
const contractFilename = `${util.cwd}/dapp/assets/{{name}}/contracts/{{name}}.sol`;

/** 
 * Upload a new {{name}} 
 * @param user User token (typically an admin)
 * @param _constructorArgs Arguments of {{name}}'s constructor
 * @param options {{../name}} deployment options (found in _/config/*.config.yaml_ via _load.config.js_) 
 * @returns Contract object
 * */
async function uploadContract(user, _constructorArgs, options) {
    const constructorArgs = marshalIn(_constructorArgs);

    const contractArgs = {
        name: contractName,
        source: await importer.combine(contractFilename),
        args: util.usc(constructorArgs),
    };

    let error = [];

    {{#each attributes}}
    {{#ifeq type "references"}}
    if (!contractArgs.args._{{field}}.length >= 1) {
        error.push('{{../name}} requires at least one {{reference}}');
    };
    {{/ifeq}}
    {{/each}}
    if (error.length) {
        throw new Error(error.join('\n'));
    }

    const copyOfOptions = {
        ...options,
        history: contractName
      }

    const contract = await rest.createContract(user, contractArgs, copyOfOptions);
    contract.src = 'removed';

    return bind(user, contract, copyOfOptions);
}

/**
 * Augment contract arguments before they are used to post a contract.
 * Its counterpart is {@link marshalOut `marshalOut`}.
 * 
 * As our arguments come into the {{lower name}} contract they first pass through `marshalIn` and 
 * when we retrieve contract state they pass through {@link marshalOut `marshalOut`}.
 * 
 * (A mathematical analogy: `marshalIn` and {@link marshalOut `marshalOut`} form something like a 
 * homomorphism) 
 * @param args - Contract state 
 */
function marshalIn(_args) {
    const defaultArgs = {
        {{#each attributes}}
        {{#ifeq type "text"}}
        {{field}}: '',
        {{/ifeq}}
        {{#ifeq type "integer"}}
        {{field}}: 0,
        {{/ifeq}}
        {{#ifeq type "datetime"}}
        {{field}}: 0,
        {{/ifeq}}
        {{#ifeq type "boolean"}}
        {{field}}: false,
        {{/ifeq}}
        {{#ifeq type "reference"}}
        {{field}}: '0',
        {{/ifeq}}
        {{#ifeq type "references"}}
        {{field}}: [],
        {{/ifeq}}
        {{/each}}
    };
    
    const args = {
        ...defaultArgs,
        ..._args,
    };
    return args;
}

async function getHistory(user, chainId, address, options) {
    const contractArgs = {
        name: `history@${contractName}`,
    }

    const copyOfOptions = {
        ...options,
        query: {
            address: `eq.${address}`,
        },
        chainIds: [chainId]
    }

    const history = await rest.search(user, contractArgs, copyOfOptions)
    return history
}

/**
 * Augment returned contract state before it is returned.
 * Its counterpart is {@link marshalIn `marshalIn`}.
 * 
 * As our arguments come into the {{lower name}} contract they first pass through {@link marshalIn `marshalIn`} 
 * and when we retrieve contract state they pass through `marshalOut`.
 * 
 * (A mathematical analogy: {@link marshalIn `marshalIn`} and `marshalOut` form something like a 
 * homomorphism) 
 * @param _args - Contract state
 */
function marshalOut(_args) {
    const args = {
        ..._args,
    };
    return args;
}

/**
 * Bind functions relevant for {{lower name}} to the _contract object. 
 * @param user User token
 * @param _contract Contract object from `rest.createContract()` etc.
 * @param options {{name}} deployment options (found in _/config/*.config.yaml_ via _load.config.js_)
 */


function bind(user, _contract, options) {
    const contract = { ..._contract };

    contract.get = async (args = { address: contract.address, }) => get(user, args, options);
    contract.getState = async () => getState(user, contract, options);
    contract.transferOwnership = async (newOwner) => transferOwnership(user, contract, options, newOwner);
    contract.update = async (args) => update(user, contract, args, options);
    contract.addOrg = async  (orgName) => addOrg(user, contract, options, orgName);
    contract.addOrgUnit = async  (orgName, orgUnit) => addOrgUnit(user, contract, options, orgName, orgUnit);
    contract.addMember = async  (orgName, orgUnit, commonName) => addMember(user, contract, options, orgName, orgUnit, commonName);
    contract.removeOrg = async  (orgName) => removeOrg(user, contract, options, orgName);
    contract.removeOrgUnit = async  (orgName, orgUnit) => removeOrgUnit(user, contract, options, orgName, orgUnit);
    contract.removeMember = async (orgName, orgUnit, commonName) => removeMember(user, contract, options, orgName, orgUnit, commonName);
    contract.addOrgs = async (orgNames) => addOrgs(user, contract, options, orgNames);
    contract.addOrgUnits = async (orgNames, orgUnits) => addOrgUnits(user, contract, options, orgNames, orgUnits);
    contract.addMembers = async (orgNames, orgUnits, commonNames) => addMembers(user, contract, options, orgNames, orgUnits, commonNames);
    contract.removeOrgs = async (orgNames) => removeOrgs(user, contract, options, orgNames);
    contract.removeOrgUnits = async (orgNames, orgUnits) => removeOrgUnits(user, contract, options, orgNames, orgUnits);
    contract.removeMembers = async (orgNames, orgUnits, commonNames) => removeMembers(user, contract, options, orgNames, orgUnits, commonNames);
    contract.getMembers = async () => getMembers(user, contract, options);
    contract.getHistory = async (args, options = contractOptions) => getHistory(user, chainId, args, options);
    contract.chainIds = options.chainIds;

    return contract;
}

/** 
 * Bind an existing {{name}} contract to a new user token. Useful for having multiple users test
 * the same contract.
 * @example <caption>Create an admin and user bound to the same new {{lower name}} contract.</caption>
 * const adminBoundContract = uploadContract(adminToken, args, options);
 * const userBoundContract = bindAddress(userToken, adminBoundContract.address, options);
 * @param user User token
 * @param address Address of the {{name}} contract
 * @param options {{name}} deployment options (found in _/config/*.config.yaml_ via _load.config.js_)
 */
function bindAddress(user, address, options) {
    const contract = {
        name: contractName,
        address,
    };
    return bind(user, contract, options);
}

/**
 * Get contract state via cirrus. A proper chainId is typically already provided in options.
 * @param args Lookup with an address or unique{{name}}ID.
 * @returns Contract state in cirrus
 */



async function get(user, args, options) {
    const { unique{{name}}ID, address, ...restArgs } = args;
    let {{lower name}};

    if (address) {
        const searchArgs = setSearchQueryOptions(restArgs, { key: 'address', value: address });
        {{lower name}} = await searchOne(contractName, searchArgs, options, user);
    } else {
        const searchArgs = setSearchQueryOptions(restArgs, { key: 'unique{{name}}ID', value: unique{{name}}ID });
        {{lower name}} = await searchOne(contractName, searchArgs, options, user);
    }
    if (!{{lower name}}) {
        return undefined;
    }

    {{#each attributes}}
    {{#ifeq type "references"}}
    // Get {{reference}} chainIds
    const {{lower reference}}Refs = await {{lower ../name}}_{{reference}}_Ref.getAllBy{{../name}}Address(user, { address: address }, options);
    const {{lower reference}}ChainIds = {{lower reference}}Refs.map(ref => ref['{{lower reference}}ChainId']); // Only grab {{lower reference}}ChainId from the {{lower reference}}
    {{/ifeq}}
    {{/each}}

    return marshalOut({ ...{{lower name}}, 
        {{#each attributes}}
        {{#ifeq type "references"}}
        {{field}}: {{lower reference}}ChainIds, 
        {{/ifeq}}
        {{/each}}
    });
}

async function getAll(admin, args = {}, options) {
    const {{lower name}}s = await searchAllWithQueryArgsLike(contractName, args, options, admin)

    const queryArgs = setSearchQueryOptionsPrime(
        {
          ...args,
          limit: undefined,
          offset: 0
        }
    )

    const totalResult = await searchAll(
        contractName,
        {
          ...queryArgs,
          sort: undefined, // can't sort and count together or postgres complains (redundant anyway)
          queryOptions: {
            ...queryArgs.queryOptions,
            select: 'count'
          },
        },
        options,
        admin,
      )

    return { {{lower name}}s: {{lower name}}s.map(({{lower name}}) => marshalOut({{lower name}})), total: totalResult[0].count}
}

/**
 * Get contract state in bloc.
 * @deprecated Use {@link get `get`} instead.
 */
async function getState(user, contract, options) {
    const state = await rest.getState(user, contract, options);
    return marshalOut(state);
}

/**
 * Update {{name}}
 */
async function update(admin, contract, _args, baseOptions) {
    const args = marshalIn(_args)
  
    const scheme = Object.keys(_args).reduce((agg, key) => {
      const base = 1
      switch (key) {
        {{#each attributes}}
        case '{{field}}':
          return agg | (base << {{@index}})
        {{/each}}
        default:
          return agg
      }
    }, 0)
  
    const callArgs = {
      contract,
      method: 'update',
      args: util.usc({
        scheme,
        ...args
      }),
    }
  
    const options = {
      ...baseOptions,
      history: [contractName],
    }
  
    const [restStatus, {{name}}Address] = await rest.call(admin, callArgs, options)
  
    if (parseInt(restStatus, 10) !== RestStatus.OK) throw new rest.RestError(restStatus, 0, { callArgs })
  
    return [restStatus, {{name}}Address];
  }

/**
 * Transfer the ownership of a {{name}}
 * @param newOwner The organization address of the new owner of the {{name}}.
 */
async function transferOwnership(user, contract, options, newOwner) {
    // they may tell us they want this date entered by the user, but we'll see
    const transferOwnershipDate = dayjs().unix();  

    const callArgs = {
      contract,
      method: 'transferOwnership',
      args: util.usc({ addr: newOwner}), // could be transferOwnershipDate
    };
    const transferStatus = await rest.call(user, callArgs, options);
  
    console.log('transferStatus', transferStatus);
    console.log(parseInt(transferStatus, 10));
    console.log(RestStatus.OK);
    if (parseInt(transferStatus, 10) !== RestStatus.OK) {
      throw new rest.RestError(transferStatus, 'You cannot transfer the ownership of a {{name}} you don\'t own', { newOwner })
    }
  
    return transferStatus
}

/**
 * Add a new organization to a {{lower name}} contract/chain.
 * @param {string} orgName The new organization to add
 */
 async function addOrg(user, contract, options, orgName) {
    const callArgs = {
        contract,
        method: 'addOrg',
        args: util.usc({ orgName }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Add a new organization unit to a {{lower name}} contract/chain.
 * @param {string} orgName The organization the unit to add belongs to
 * @param {string} orgUnit The new organization unit to add
 */
 async function addOrgUnit(user, contract, options, orgName, orgUnit) {
    const callArgs = {
        contract,
        method: 'addOrgUnit',
        args: util.usc({ orgName, orgUnit }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Add a new member to a {{lower name}} contract/chain.
 * @param {string} orgName The organization the member to add belongs to
 * @param {string} orgUnit The organization unit the member to add belongs to
 * @param {string} commonName The common name of the member to add
 */
async function addMember(user, contract, options, orgName, orgUnit, commonName) {
    const callArgs = {
        contract,
        method: 'addMember',
        args: util.usc({ orgName, orgUnit, commonName }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove an existing organization from a {{lower name}} contract/chain.
 * @param {string} orgName The organization to remove
 */
 async function removeOrg(user, contract, options, orgName) {
    const callArgs = {
        contract,
        method: 'removeOrg',
        args: util.usc({ orgName }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove an existing organization unit from a {{lower name}} contract/chain.
 * @param {string} orgName The organization the unit to remove belongs to
 * @param {string} orgUnit The organization unit to remove
 */
 async function removeOrgUnit(user, contract, options, orgName, orgUnit) {
    const callArgs = {
        contract,
        method: 'removeOrgUnit',
        args: util.usc({ orgName, orgUnit }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove an existing member from a {{lower name}} contract/chain.
 * @param {string} orgName The organization the member to remove belongs to
 * @param {string} orgUnit The organization unit the member to remove belongs to
 * @param {string} commonName The common name of the member to remove
 */
 async function removeMember(user, contract, options, orgName, orgUnit, commonName) {
    const callArgs = {
        contract,
        method: 'removeMember',
        args: util.usc({ orgName, orgUnit, commonName }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Add multiple new organizations to a {{lower name}} contract/chain.
 * @param {string} orgNames An array of new organizations to add
 */
 async function addOrgs(user, contract, options, orgNames) {
    const callArgs = {
        contract,
        method: 'addOrgs',
        args: util.usc({ orgNames }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Add multiple new organization units to a {{lower name}} contract/chain.
 * @param {string} orgNames An array of organizations the units to add belongs to
 * @param {string} orgUnits An array of new organization units to add 
 */
 async function addOrgUnits(user, contract, options, orgNames, orgUnits) {
    const callArgs = {
        contract,
        method: 'addOrgUnits',
        args: util.usc({ orgNames, orgUnits }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Add multiple new members to a {{lower name}} contract/chain.
 * @param {string} orgNames An array of organizations the units to add belongs to
 * @param {string} orgUnits An array of organization units the members to add belongs to
 * @param {string} commonNames An array of the common names of the members to add
 */
 async function addMembers(user, contract, options, orgNames, orgUnits, commonNames) {
    const callArgs = {
        contract,
        method: 'addMembers',
        args: util.usc({ orgNames, orgUnits, commonNames }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove multiple existing organizations from a {{lower name}} contract/chain.
 * @param {string[]} orgNames An array of organizations to remove
 */
 async function removeOrgs(user, contract, options, orgNames) {
    const callArgs = {
        contract,
        method: 'removeOrgs',
        args: util.usc({ orgNames }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove multiple existing organization units from a {{lower name}} contract/chain.
 * @param {string[]} orgNames An array of organizations the units to remove belongs to
 * @param {string[]} orgUnits An array of organization units to remove
 */
 async function removeOrgUnits(user, contract, options, orgNames, orgUnits) {
    const callArgs = {
        contract,
        method: 'removeOrgUnits',
        args: util.usc({ orgNames, orgUnits }),
    };
    return rest.call(user, callArgs, options);
}

/**
 * Remove multiple existing members from a {{lower name}} contract/chain.
 * @param {string[]} orgNames An array of organizations the units to remove belongs to
 * @param {string[]} orgUnits An array of organization units the members to remove belongs to
 * @param {string[]} commonNames An array of the common names of the members to remove
 */
 async function removeMembers(user, contract, options, orgNames, orgUnits, commonNames) {
    const callArgs = {
        contract,
        method: 'removeMembers',
        args: util.usc({ orgNames, orgUnits, commonNames }),
    };
    return rest.call(user, callArgs, options);
}

export default {
    uploadContract,
    contractName,
    contractFilename,
    bindAddress,
    get,
    getAll,
    transferOwnership,
    update,
    marshalIn,
    marshalOut,
    getHistory
}
