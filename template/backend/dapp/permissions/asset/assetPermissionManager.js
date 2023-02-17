import { importer, rest, util } from 'blockapps-rest'
import RestStatus from 'http-status-codes'
import { getAssetRoles } from '/helpers/enums'

const { createContract } = rest

const contractName = 'AssetPermissionManager'
const contractFilename = `${util.cwd}/dapp/permissions/asset/contracts/AssetPermissionManager.sol`

const grantRole = async (admin, contract, contractArgs, options) => {
  const { user, role } = contractArgs

  const args = {
    id: 'AssetChain',
    address: user.account ? user.account : user.address,
    role,
  }

  const callArgs = {
    contract,
    method: 'grantRole',
    args: util.usc(args),
  }

  const [restStatus, permissions] = await rest.call(admin, callArgs, options)

  if (parseInt(restStatus) !== RestStatus.OK) {
    throw new rest.RestError(restStatus, 0, { ...callArgs })
  }
  return parseInt(permissions, 10)
}

const can = async (admin, contract, methodArgs, options) => {
  const { method, address } = methodArgs
  const args = { address }

  const callArgs = { contract, method, args: util.usc(args) }
  const [isPermitted] = await rest.call(admin, callArgs, options)
  return isPermitted
}

const getRolePermissions = async (admin, contract, methodArgs, options) => {
  const { role } = methodArgs
  const callArgs = {
    contract,
    method: 'getRolePermissions',
    args: util.usc({ role }),
  }
  const [permissions] = await rest.call(admin, callArgs, options)
  return permissions
}

const getUserPermissions = async (admin, contract, methodArgs, options) => {
  const { address } = methodArgs
  const callArgs = {
    contract,
    method: 'getPermissions',
    args: util.usc({ address }),
  }
  const [restStatus, permissions] = await rest.call(admin, callArgs, options)

  if (parseInt(restStatus) !== RestStatus.OK) {
    throw new rest.RestError(restStatus, 0, { ...callArgs })
  }
  return permissions
}

const canUpdateAsset = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canUpdateAsset' }, options)
const canTransferAsset = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canTransferAsset' }, options)

const bind = (admin, _contract, options) => {
  const contract = _contract

  contract.grantRole = async (args) => grantRole(admin, contract, args, options)

  contract.grantAdminRole = async (_args) => {
    const role = (getAssetRoles()).ADMIN
    const contractArgs = {
      ..._args,
      role,
    }
    await grantRole(admin, contract, contractArgs, options)
  }
  contract.getRolePermissions = async (args) => getRolePermissions(admin, contract, args, options)
  contract.getUserPermissions = async (args) => getUserPermissions(admin, contract, args, options)

  contract.canUpdateAsset = async (args) => canUpdateAsset(admin, contract, args, options)
  contract.canTransferAsset = async (args) => canTransferAsset(admin, contract, args, options)
  return contract
}

async function uploadContract(admin, args, options) {
  const contractArgs = {
    name: contractName,
    source: await importer.combine(contractFilename),
    args: util.usc(args),
  }

  const contract = await createContract(admin, contractArgs, options)
  contract.src = 'removed'

  return bind(admin, contract, options)
}

const bindAddress = (user, address, options) => {
  const contract = {
    name: contractName,
    address,
  }

  return bind(user, contract, options)
}

export default {
  bind,
  bindAddress,
  uploadContract,
  contractName,
}
