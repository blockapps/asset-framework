import RestStatus from 'http-status-codes';
import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call, RestError } = rest;

import config from '../../util/load.config';

const contractName = 'PermissionManager';
const contractFilename = `${util.cwd}/${config.libPath}/auth/permission/contracts/PermissionManager.sol`;
const options = { config }

util.bitmaskToEnumString = function (bitmask, bitmaskEnum) {
  const strings = []
  for (let i = 0; i < bitmaskEnum.MAX; i++) {
    const mask = (1 << i)
    if (bitmask & mask) {
      strings.push(bitmaskEnum[i])
    }
  }
  return strings
}


async function uploadContract(admin, master) {
  // NOTE: in production, the contract is created and owned by the AdminInterface
  // for testing purposes the creator is the admin user
  const args = { master: master.address, owner: admin.address };
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await createContract(admin, contractArgs, options)
  contract.src = 'removed';
  return bind(admin, contract);
}

async function createPermissionsAdmin(admin, master, permissions) {
  const contract = await uploadContract(admin, master);
  // add permission to create and modify contracts
  const args = { address: admin.address, id: admin.name, permissions: permissions };
  await contract.grant(args);
  return contract;
}

function bind(admin, contract) {
  contract.getState = async function () {
    return await getState(contract, options);
  }
  contract.grant = async function (args) {
    return await grant(admin, contract, args);
  }
  contract.getPermissions = async function (args) {
    return await getPermissions(admin, contract, args);
  }
  contract.revoke = async function (args) {
    return await revoke(admin, contract, args);
  }
  contract.check = async function (args) {
    return await check(admin, contract, args);
  }
  contract.listPermits = async function (args) {
    return await listPermits(admin, contract, args);
  }
  contract.listEvents = async function (args) {
    return await listEvents(admin, contract, args);
  }
  contract.transferOwnership = async function (args) {
    return await transferOwnership(admin, contract, args);
  }
  return contract;
}

function bindAddress(admin, address) {
  const contract = {
    name: contractName,
    address,
  }
  return bind(admin, contract)
}

// throws: ErrorCodes
// returns: updated permissions
async function grant(admin, contract, args) {
  // function grant(address _address, uint _permissions) returns (ErrorCodes) {
  const callArgs = {
    contract,
    method: 'grant',
    args: util.usc(args)
  }

  const [restStatus, permissions] = await call(admin, callArgs, options);
  if (restStatus != RestStatus.OK) {
    throw new RestError(restStatus, callArgs.method, callArgs.args);
  }
  return permissions;
}

// throws: ErrorCodes
// returns: permissions
async function getPermissions(admin, contract, args) {
  // function getPermissions(address _address) returns (ErrorCodes, uint) {
  const callArgs = {
    contract,
    method: 'getPermissions',
    args: util.usc(args)
  }

  const [restStatus, permissions] = await call(admin, callArgs, options);
  if (restStatus != RestStatus.OK) {
    throw new RestError(restStatus, callArgs.method, callArgs.args);
  }
  return permissions;
}

// throws: ErrorCodes
// returns: true if permitted
async function check(admin, contract, args) {
  // function check(address _address, uint _permissions) returns (ErrorCodes) {
  const callArgs = {
    contract,
    method: 'check',
    args: util.usc(args)
  }

  const [restStatus] = await call(admin, callArgs, options);
  if (restStatus != RestStatus.OK) {
    return false;
  }
  return true;
}

// throws: ErrorCodes
async function revoke(admin, contract, args) {
  // function revoke(address _address) returns (ErrorCodes) {
  const callArgs = {
    contract,
    method: 'revoke',
    args: util.usc(args)
  }

  const [restStatus] = await call(admin, callArgs, options);
  if (restStatus != RestStatus.OK) {
    throw new RestError(restStatus, callArgs.method, callArgs.args);
  }
  return RestStatus.OK;
}

// transferOwnership
async function transferOwnership(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'transferOwnership',
    args: util.usc(args)
  }

  const [restStatus] = await call(admin, callArgs, {});
  if (restStatus != RestStatus.OK) {
    throw new RestError(restStatus, method, args);
  }
  return RestStatus.OK;
}

// list
async function listPermits(admin, contract, args) {
  const { permits } = await contract.getState()
  const permitsJson = permits.map((permit) => {
    permit.permissionsHex = Number(permit.permissions).toString(16)
    permit.strings = util.bitmaskToEnumString(permit.permissions, args.enum)
    return permit
  })
  return permitsJson
}

async function listEvents(admin, contract, args) {
  const { eventLog } = await contract.getState()
  const eventsJson = eventLog.map((event) => {
    event.permissionsHex = Number(event.permissions).toString(16)
    event.strings = util.bitmaskToEnumString(event.permissions, args.enum)
    return event
  })
  return eventsJson
}

export {
  bind,
  bindAddress,
  uploadContract,
  createPermissionsAdmin,
  contractName,
};
