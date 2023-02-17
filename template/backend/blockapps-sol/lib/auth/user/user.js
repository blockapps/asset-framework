import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call, searchUntil } = rest;
import config from '../../util/load.config';

const options = { config };

const contractName = 'User';
const contractFilename = `${util.cwd}/${config.libPath}/auth/user/contracts/User.sol`;

async function uploadContract(admin, args) {
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
  contract.authenticate = async function (pwHash) {
    return await authenticate(admin, contract, pwHash);
  }
  return contract;
}

async function getUsers(addresses) { // FIXME must break to batches of 50 addresses
  const csv = util.toCsv(addresses); // generate csv string

  function predicate(response) {
    return response;
  }

  const contract = {
    name: contractName
  }
  const results = await searchUntil(contract, predicate, { config, query: { address: `in.${csv}` } });
  return results;
}

async function getUser(username) {
  function predicate(response) {
    if (response.length >= 1) {
      return response;
    }
  }

  const contract = {
    name: contractName
  }

  const response = (await searchUntil(contract, predicate, { config, query: { username: `eq.${username}` } }))[0];
  return response;
}

async function getUserByAddress(address) {
  function predicate(response) {
    if (response.length >= 1) {
      return response;
    }
  }

  const contract = {
    name: contractName, address
  }
  const response = (await searchUntil(contract, predicate, { config, query: { address: `eq.${address}` } }))[0];
  return response;
}

async function authenticate(admin, contract, pwHash) {
  // function authenticate(bytes32 _pwHash) return (bool) {
  const args = {
    pwHash: pwHash,
  };
  const callArgs = {
    contract,
    method: 'authenticate',
    args: util.usc(args)
  }
  const result = await call(admin, callArgs, options);
  const isAuthenticated = (result[0] === true);
  return isAuthenticated;
}


export {
  uploadContract,
  bind,
  // constants
  contractName,

  // business logic
  authenticate,
  getUserByAddress,
  getUsers,
  getUser
};
