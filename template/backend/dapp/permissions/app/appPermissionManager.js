import { importer, rest, util } from 'blockapps-rest'
import RestStatus from 'http-status-codes'
import { getAppRoles } from '/helpers/enums'
import config from '/load.config'

const { createContract } = rest

const contractName = 'AppPermissionManager'
const contractFilename = `${util.cwd}/dapp/permissions/app/contracts/AppPermissionManager.sol`

const grantRole = async (admin, contract, contractArgs, options) => {
  const { user, role } = contractArgs

  const args = {
    id: 'AppChain',
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

const canModifyMembership = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canModifyMembership' }, options)
const canCreateOrganization = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canCreateOrganization' }, options)
const canUpdateOrganization = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canUpdateOrganization' }, options)
const canCreateUser = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canCreateUser' }, options)
const canUpdateUser = async (admin, contract, args, options) => can(admin, contract, { ...args, method: 'canUpdateUser' }, options)

const bind = (admin, _contract, options) => {
  const contract = _contract

  contract.grantRole = async (args) => grantRole(admin, contract, args, options)

  contract.grantGlobalAdminRole = async (_args) => {
    const role = (getAppRoles()).GLOBAL_ADMIN
    const contractArgs = {
      ..._args,
      role,
    }
    await grantRole(admin, contract, contractArgs, options)
  }
  contract.grantOrganizationAdminRole = async (_args) => {
    const role = (getAppRoles()).ORG_ADMIN
    const contractArgs = {
      ..._args,
      role,
    }
    await grantRole(admin, contract, contractArgs, options)
  }

  contract.getRolePermissions = async (args) => getRolePermissions(admin, contract, args, options)
  contract.getUserPermissions = async (args) => getUserPermissions(admin, contract, args, options)

  contract.canModifyMembership = async (args) => canModifyMembership(admin, contract, args, options)
  contract.canCreateOrganization = async (args) => canCreateOrganization(admin, contract, args, options)
  contract.canUpdateOrganization = async (args) => canUpdateOrganization(admin, contract, args, options)
  contract.canCreateUser = async (args) => canCreateUser(admin, contract, args, options)
  contract.canUpdateUser = async (args) => canUpdateUser(admin, contract, args, options)
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
