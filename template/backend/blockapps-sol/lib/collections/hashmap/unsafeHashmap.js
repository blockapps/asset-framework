
import { rest, util, importer } from 'blockapps-rest';
const { createContract, getState, call } = rest;

import config from '../../util/load.config';
const contractName = 'UnsafeHashmap'
const contractFilename = `${config.libPath}/collections/hashmap/contracts/UnsafeHashmap.sol`
const options = { config }

async function uploadContract(admin) {
  const args = {}

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
  contract.getStateVar = async function (args) {
    return await rest.getStateVar(contract, args.name, args.count, args.offset, args.length)
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
  return parseInt(result[0])
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
  uploadContract,
}
