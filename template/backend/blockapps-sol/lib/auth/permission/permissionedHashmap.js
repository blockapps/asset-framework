import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call, getArray } = rest;

import config from '../../util/load.config';

const contractName = 'PermissionedHashmap'
const contractFilename = `${config.libPath}/auth/permission/contracts/PermissionedHashmap.sol`
const options = { config }

async function uploadContract(admin, permissionManager) {
  const args = { permissionManager: permissionManager.address }

  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args)
  }

  const contract = await createContract(admin, contractArgs, options)
  contract.src = 'removed'
  return bind(admin, contract)
}

function bind(admin, _contract) {
  const contract = _contract
  contract.getState = async function () {
    return await getState(contract, options)
  }
  contract.getArray = async function (name) {
    return await getArray(contract, name, options)
  }

  contract.put = async function (args) {
    return await put(admin, contract, args)
  }
  contract.get = async function (args) {
    return await get(admin, contract, args)
  }
  contract.contains = async function (args) {
    return await contains(admin, contract, args)
  }
  contract.size = async function (args) {
    return await size(admin, contract, args)
  }
  contract.remove = async function (args) {
    return await remove(admin, contract, args)
  }

  return contract
}

function bindAddress(admin, address) {
  const contract = {
    name: contractName,
    address,
  }
  return bind(admin, contract)
}

async function put(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'put',
    args: util.usc(args)
  }

  const result = await call(admin, callArgs, options)
  return result
}

async function get(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'get',
    args: util.usc(args)
  }

  const result = await call(admin, callArgs, options)
  return result[0]
}

async function contains(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'contains',
    args: util.usc(args)
  }

  const result = await call(admin, callArgs, options)
  return result[0] == true
}

async function size(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'size',
    args: util.usc(args)
  }
  const result = await call(admin, callArgs, options)
  return parseInt(result[0], 10)
}

async function remove(admin, contract, args) {
  const callArgs = {
    contract,
    method: 'remove',
    args: util.usc(args)
  }

  await call(admin, callArgs, options)
}

export {
  bind,
  bindAddress,
  uploadContract,
}
