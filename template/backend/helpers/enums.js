import { util } from '/blockapps-rest-plus'
import { getEnumsCached } from '/helpers/parse'
import config from '/load.config'

// get roles and permissions from enums
const getAppRolesInternal = getEnumsCached(`${util.cwd}/dapp/permissions/app/contracts/Role.sol`)
const getAppPermissionsInternal = getEnumsCached(`${util.cwd}/dapp/permissions/app/contracts/Permission.sol`)
const getAssetRolesInternal = getEnumsCached(`${util.cwd}/dapp/permissions/asset/contracts/AssetRole.sol`)
const getAssetPermissionsInternal = getEnumsCached(`${util.cwd}/dapp/permissions/asset/contracts/AssetPermission.sol`)

// use these externally
const getAppRoles = () => getAppRolesInternal()
const getAppPermissions = () => getAppPermissionsInternal()
const getAssetRoles = () => getAssetRolesInternal()
const getAssetPermissions = () => getAssetPermissionsInternal()

// membership events and state
const getMembershipStatesInternal = getEnumsCached(`${util.cwd}/dapp/memberships/contracts/MembershipState.sol`)
const getMembershipEventsInternal = getEnumsCached(`${util.cwd}/dapp/memberships/contracts/MembershipEvent.sol`)

const getMembershipStates = () => getMembershipStatesInternal()
const getMembershipEvents = () => getMembershipEventsInternal()

export {
  getAppRoles,
  getAppPermissions,
  getAssetRoles,
  getAssetPermissions,
  getMembershipStates,
  getMembershipEvents,
}
