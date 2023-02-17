import RestStatus from 'http-status-codes';
import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call, RestError } = rest;
import config from '../../util/load.config';

const contractName = 'UserManager';
const contractFilename = `${util.cwd}/${config.libPath}/auth/user/contracts/UserManager.sol`;

const options = { config };

import * as userJs from './user';

async function uploadContract(admin) {
  // NOTE: in production, the contract is created and owned by the AdminInterface
  // for testing purposes the creator is the admin user
  const args = { owner: admin.address };
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }
  const contract = await createContract(admin, contractArgs, options);
  contract.src = 'removed';
  return bind(admin, contract);
}

function bind(admin, contract) {
  contract.getState = async function () {
    return await getState(contract, options);
  }
  contract.createUser = async function (args) {
    return await createUser(admin, contract, args);
  }
  contract.exists = async function (username) {
    return await exists(admin, contract, username);
  }
  contract.getUser = async function (username) {
    return await getUser(admin, contract, username);
  }
  contract.getUsers = async function () {
    return await getUsers(admin, contract);
  }
  contract.authenticate = async function (args) {
    return await authenticate(admin, contract, args);
  }
  return contract;
}

// throws: RestStatus
// returns: user record from search
async function createUser(admin, contract, args) {
  // function createUser(address account, string username, bytes32 pwHash, uint role) returns (ErrorCodes) {
  const callArgs = {
    contract,
    method: 'createUser',
    args: util.usc(args)
  }

  // create the user, with the eth account
  const [restStatus] = await call(admin, callArgs, options);
  // TODO:  add RestStatus api call. No magic numbers
  if (restStatus != RestStatus.CREATED) {
    throw new RestError(restStatus, callArgs.method, callArgs.args);
  }
  // block until the user shows up in search
  const user = await getUser(admin, contract, args.username);
  return user;
}

async function exists(admin, contract, username) {
  // function exists(string username) returns (bool) {
  const args = {
    username: username,
  };

  const callArgs = {
    contract,
    method: 'exists',
    args: util.usc(args)
  }

  const result = await call(admin, callArgs, options);
  const exist = (result[0] === true);
  return exist;
}

async function getUser(admin, contract, username) {
  // function getUser(string username) returns (address) {
  const args = {
    username: username,
  };

  const callArgs = {
    contract,
    method: 'getUser',
    args: util.usc(args)
  }

  // get the use address
  const [address] = await call(admin, callArgs, options);
  if (address == 0) {
    throw new RestError(RestStatus.NOT_FOUND, callArgs.method, args);
  }
  // found - query for the full user record
  return await userJs.getUserByAddress(address);
}

async function getUsers(admin, contract) {
  const { users: usersHashmap } = await rest.getState(contract, options);
  const { values } = await getState({ name: 'Hashmap', address: usersHashmap }, options);
  const addresses = values.slice(1);
  return await userJs.getUsers(addresses);
}

async function authenticate(admin, contract, args) {
  // function authenticate(string _username, bytes32 _pwHash) returns (bool) {
  const callArgs = {
    contract,
    method: 'authenticate',
    args: util.usc(args)
  }
  const [result] = await call(admin, callArgs, options);
  const isOK = (result == true);
  return isOK;
}

export {
  uploadContract,
  contractName,
  bind
};