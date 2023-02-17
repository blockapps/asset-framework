import { rest, util, importer } from "blockapps-rest"
const { createContract } = rest
import config from "../../load.config"
import constants from '../../helpers/constants'
import { yamlWrite, yamlSafeDumpSync, getYamlFile } from "../../helpers/config"

// import organizationManagerJs from '/dapp/organizations/organizationManager'
import certificateJs from '/dapp/certificates/certificate'

{{#each assets}}
import {{lower name}}ChainJs from '/dapp/assets/{{name}}/{{lower name}}Chain'
import {{lower name}}Js from '/dapp/assets/{{name}}/{{lower name}}'
{{/each}}


const allAssetNames = [
    {{#each assets}}
    {{lower name}}Js.contractName,
    {{/each}}
  ]

const contractName = "Dapp"
const mainChainContractName = "MyApp"
const contractFileName = `dapp/dapp/contracts/Dapp.sol`


const balance = 100000000000000000000


// interface Member {
//   access?:boolean,
//   orgName?:string,
//   orgUnit?:string,
//   commonName?:string
// }



async function uploadDappChain(user, mainChainAddress, initialMembers, defaultOptions) {
  const getKeyResponse = await rest.getKey(user, defaultOptions)
  const uid = util.uid()

  const myCert = await certificateJs.getCertificateMe(user)
  
  const members = myCert ? 
    [ ...initialMembers,
      { 
        orgName: myCert.organization,
        orgUnit: myCert.organizationalUnit || '',
        commonName: '',
        access: true,
      },
    ] : (initialMembers.length > 0 ? initialMembers : [{}])


  const chainArgs = {
    name: contractName,
    label: `{{name}}Dapp-Shard_${uid}`,
    codePtr: {
      account: mainChainAddress,
      name: contractName
    },
    args: {},
    members,
    balances: [
      {
        address: getKeyResponse,
        balance
      },
      {
        address: '0000000000000000000000000000000000000100',
        balance
      }
    ],
    metadata: {
      VM: 'SolidVM',
    },
  }

  const contractArgs = { name: contractName }

  const optionsWithHistory = {
    ...defaultOptions,
    history: [allAssetNames]
  }

  const chain = await rest.createChain(user, chainArgs, contractArgs, optionsWithHistory)
  
  return bind(user, { 
    name: contractName,
    address: constants.governanceAddress,
  },
  { 
    chainIds: [chain], 
    ...defaultOptions ,
  })
}


function deploy(contract, args, options) {
  console.log(options);
  // author the deployment
  const { deployFilePath } = args

  const deployment = {
    url: options.config.nodes[0].url,
    dapp: {
      contract: {
        name: contract.name,
        address: contract.address,
        appChainId: options.chainIds[0]
      }
    }
  }

  if (options.config.apiDebug) {
    console.log("deploy filename:", deployFilePath)
    console.log(yamlSafeDumpSync(deployment))
  }

  yamlWrite(deployment, deployFilePath)

  return deployment
}

async function loadFromDeployment(admin, deployFilename, options) {
  const deployFile = getYamlFile(deployFilename)
  return await bind(admin, deployFile.dapp.contract, {
    chainIds: [deployFile.dapp.contract.appChainId],
    ...options
  })
}


async function uploadMainChainContract(token, options) {
  const source = await importer.combine(contractFileName)
  const contractArgs = {
    name: mainChainContractName,
    source,
    args: {},
  };

  const copyOfOptions = {
    ...options,
    history: [
      contractName,
      ...allAssetNames
    ]
  }

  const contract = await createContract(token, contractArgs, copyOfOptions);
  contract.src = "removed";

  return await bind(token, contract, options)
}

async function uploadContract(token, options) {
  const source = await importer.combine(contractFileName)
  const contractArgs = {
    name: contractName,
    source,
    args: {},
  };

  const copyOfOptions = {
    ...options,
    history: [contractName]
  }

  const contract = await createContract(token, contractArgs, options);
  contract.src = "removed";

  return await bind(token, contract, options)
}


async function getManagersAndCirrusInfo(admin, contract, options) {
  const state = await rest.getState(admin, contract, options)

  const cirrusOrg = state.bootUserOrganization !== '' ? state.bootUserOrganization : undefined

  return {
    cirrusOrg,
  }
}

async function bind(rawAdmin, _contract, _defaultOptions) {
  const contract = _contract;
  const managers = await getManagersAndCirrusInfo(rawAdmin, contract, _defaultOptions)
  
  // includes the org+app for cirrus namespacing (helpers/utils.js will prepend to cirrus queries)
  const defaultOptions = {
    ..._defaultOptions,
    org: managers.cirrusOrg,
    app: contractName,
  }
  // for querying data not on the dapp shard
  const optionsNoChainIds = { 
    ...defaultOptions,
    chainIds: [],
  }

  const dappAddress = contract.address
  const admin = { dappAddress, ...rawAdmin }
  
  contract.managers = managers
  contract.chainId = defaultOptions.chainIds ? defaultOptions.chainIds[0] : undefined
  

  // --------------------------- DAPP MANAGEMENT --------------------------------
    // governance - single add
  contract.addOrg = async function (orgName) {
    return addOrg(admin, contract, defaultOptions, orgName);
  }
  contract.addOrgUnit = async function (orgName, orgUnit) {
    return addOrgUnit(admin, contract, defaultOptions, orgName, orgUnit);
  }
  contract.addMember = async function (orgName, orgUnit, commonName) {
    return addMember(admin, contract, defaultOptions, orgName, orgUnit, commonName);
  }
  contract.removeOrg = async function (orgName) {
    return removeOrg(admin, contract, defaultOptions, orgName);
  }
  contract.removeOrgUnit = async function (orgName, orgUnit) {
    return removeOrgUnit(admin, contract, defaultOptions, orgName, orgUnit);
  }
  contract.removeMember = async function (orgName, orgUnit, commonName) {
    return removeMember(admin, contract, defaultOptions, orgName, orgUnit, commonName);
  }

    // governance - multiple adds
  contract.addOrgs = async function (orgNames) {
    return addOrgs(admin, contract, defaultOptions, orgNames);
  }  
  contract.addOrgUnits = async function (orgNames, orgUnits) {
    return addOrgUnits(admin, contract, defaultOptions, orgNames, orgUnits);
  }
  contract.addMembers = async function (orgNames, orgUnits, commonNames) {
    return addMembers(admin, contract, defaultOptions, orgNames, orgUnits, commonNames);
  }
  contract.removeOrgs = async function (orgNames) {
    return removeOrgs(admin, contract, defaultOptions, orgNames);
  }
  contract.removeOrgUnits = async function (orgNames, orgUnits) {
    return removeOrgUnits(admin, contract, defaultOptions, orgNames, orgUnits);
  }
  contract.removeMembers = async function (orgNames, orgUnits, commonNames) {
    return removeMembers(admin, contract, defaultOptions, orgNames, orgUnits, commonNames);
  }
 
  // state and deployment
  contract.getState = async function () {
    return rest.getState(admin, contract, defaultOptions)
  }
  contract.deploy = function (args, options = defaultOptions) {
    const deployment = deploy(contract, args, options);
    return deployment;
  }

  // -------------------------- CERTIFICATES --------------------------------
  contract.getCertificate = async function (args) {
    return certificateJs.getCertificate(admin, args)
  }
  contract.getCertificateMe = async function () {
    return certificateJs.getCertificateMe(admin)
  }
  contract.getCertificates = async function (args) {
    return certificateJs.getCertificates(admin, args)
  }


  // ------------------------------ ROLES --------------------------------
  contract.grantGlobalAdminRole = async function (args, options = defaultOptions) {
    return managers.appPermissionManager.grantGlobalAdminRole(args, options)
  }
  contract.grantOrganizationAdminRole = async function (args, options = defaultOptions) {
    return managers.appPermissionManager.grantOrganizationAdminRole(args, options)
  }

  // --------------------------------- ASSETS ---------------------------------

  {{#each assets}}
  contract.create{{name}} = async function (args, options = defaultOptions) {
    const { {{lower name}}Args, isPublic } = args;
    const createOptions = {...options, org: managers.cirrusOrg, app: mainChainContractName }
    if (isPublic) {
      return {{lower name}}Js.uploadContract(rawAdmin, { 
        appChainId: contract.chainId,
        ...{{lower name}}Args,
      }, createOptions);
    } else {
      return {{lower name}}ChainJs.create{{name}}(rawAdmin, { 
        appChainId: contract.chainId,
        ...{{lower name}}Args,
      }, createOptions);
    }
  }

  contract.get{{name}} = async function (args, options = optionsNoChainIds) {
    return {{lower name}}Js.get(rawAdmin, args, {...options, org: managers.cirrusOrg, app: mainChainContractName})
  }

  contract.get{{name}}s = async function (args = {}, options = optionsNoChainIds) {
    const getOptions = {...options, org: managers.cirrusOrg, app: mainChainContractName}
    return {{lower name}}Js.getAll(rawAdmin, { 
      appChainId: contract.chainId,
      ...args
    }, getOptions)
  }

  contract.transferOwnership{{name}} = async function (args, options = defaultOptions) {
    const { address, chainId, newOwner } = args

    const contract = {
      name: {{lower name}}Js.contractName,
      address: address,
    }

    const chainOptions = { chainIds: [chainId], ...options }

    return {{lower name}}Js.transferOwnership(rawAdmin, contract, chainOptions, newOwner)
  }

  contract.update{{name}} = async function (args, options = defaultOptions) {
    const { address, chainId, updates } = args;

    const contract = {
      name: {{lower name}}Js.contractName,
      address: address,
    };

    const chainOptions = { chainIds: [chainId], ...options };

    return {{lower name}}Js.update(rawAdmin, contract, updates, chainOptions);
  }

  contract.audit{{name}} = async function (args, options = defaultOptions) {
    const { address, chainId } = args;
    const auditOptions = {...options, org: managers.cirrusOrg, app: mainChainContractName}
    return {{lower name}}Js.getHistory(rawAdmin, chainId, address, auditOptions);
  }


  {{/each}}

  return contract;
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
* @param {string} orgNames An array of organizations to remove
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
* @param {string} orgNames An array of organizations the units to remove belongs to
* @param {string} orgUnits An array of organization units to remove
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
* @param {string} orgNames An array of organizations the units to remove belongs to
* @param {string} orgUnits An array of organization units the members to remove belongs to
* @param {string} commonNames An array of the common names of the members to remove
*/
async function removeMembers(user, contract, options, orgNames, orgUnits, commonNames) {
  const callArgs = {
      contract,
      method: 'removeMembers',
      args: util.usc({ orgNames, orgUnits, commonNames }),
  };
  return rest.call(user, callArgs, options);
}

async function getChainById(user, chainId) {
  const chainInfo = await rest.getChain(user, chainId, options)
  return chainInfo
}

async function getChains(user, chainIds = []) {
  const keyResponse = await rest.getKey(user, defaultOptions)
  let chains

  try {
    chains = await rest.getChains(user, chainIds, defaultOptions)
  } catch (e) {
    if (e.response.status === 500) {
      chains = []
    }
    console.error('Error getting chainInfo:', e)
  }

  const filtered = chains.reduce((acc, c) => {
    const member = c.info.members.find((m) => {
      return m.address === keyResponse
    })
    if (member !== undefined) {
      acc.push(c)
    }
    return acc
  }, [])

  return filtered
}



export default {
  bind,
  loadFromDeployment,
  uploadMainChainContract,
  uploadContract,
  uploadDappChain,
};









