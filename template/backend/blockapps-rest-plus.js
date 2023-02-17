import jwtDecode from 'jwt-decode'
import { rest, util, importer, fsUtil } from 'blockapps-rest'
import { assert } from 'chai'
import isSubset from 'is-subset'

import oauthHelper from '/helpers/oauthHelper'

// extra information for exceptions
async function enhancedException(func) {
  try {
    return await func()
  } catch (e) {
    if (e.response && e.response.data) {
      const responseData = (e.response.data instanceof Object)
        ? JSON.stringify(e.response.data, null, 2)
        : e.response.data
      throw new Error(`${e.message}\n ${responseData}`)
    }
    throw (e)
  }
}

// enhancedException for createContract
const createContractImpl = rest.createContract
rest.createContract = async (user, contract, options) => enhancedException(async () => createContractImpl(user, contract, options))

rest.waitForAddress = async function (user, contract, options) {
  const { chainIds, ...reducedOptions } = options
  const query = {
    address: `eq.${contract.address}`,
  }

  if (chainIds && Array.isArray(chainIds)) {
    query.chainId = `eq.${chainIds[0]}`
  }

  const searchOptions = {
    query,
    ...reducedOptions,
  }

  function predicate(response) {
    return (
      response !== undefined
      && response.length !== undefined
      && response.length > 0
    )
  }

  const results = await rest.searchUntil(user, contract, predicate, searchOptions)
  return results[0]
}

// assert improvements
assert.isSubset = (superSet, subSet, message = '') => {
  const result = isSubset(superSet, subSet)
  const errorMessage = `${message}. Not subset \n${JSON.stringify(subSet, null, 2)},\n${JSON.stringify(superSet, null, 2)}\n`
  assert.ok(result, errorMessage)
}

// util improvements
util.getApplicationCredentials = async () => {
  const token = await oauthHelper.getServiceToken()
  const decodedToken = jwtDecode(token)
  return { name: decodedToken.preferred_username, token }
}

util.createApplicationUser = async (options) => {
  const applicationCredentials = await util.getApplicationCredentials()
  return rest.createUser(applicationCredentials, options)
}

export {
  rest,
  util,
  importer,
  fsUtil,
  assert,
}
