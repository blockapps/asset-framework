import { rest } from '/blockapps-rest-plus'
import constants from './constants'

const buildOrderQueryOption = (args) => {
  const { sort } = args
  if (sort) {
    const direction = sort.startsWith('+') ? 'asc' : 'desc'
    const field = sort.substr(1)
    return `${field}.${direction}`
  }
  return undefined
}


export const waitForAddress = async(admin, contract, options) => {
  const org = options.org
  const app = options.app == contract.name ? undefined : options.app
 
  const tableName = org ? 
    (app ? (org + "-" + app + "-" + contract.name) : (org + "-" + contract.name))
    : contract.name 

  contract['name'] = tableName

  return await rest.waitForAddress(admin, contract, options)
}

/**
 * Wait for a particular owner address to show up in a particular table.
 * If ContractA creates an instance of ContractB, then we can use waitForOwner to wait for
 * ContractA's address to show up in the owner column of ContractB. Proving that ContractA's instance
 * of ContractB now exists in Cirrus.
 * @param admin User token
 * @param contract Must have an owner and name. Ex. { owner: '123', name: 'MyContract' }
 * @param options Passed options
 */
export const waitForOwner = async(admin, contract, options) => {
  const org = options.org
  const app = options.app == contract.name ? undefined : options.app

  const tableName = org ?
    (app ? (org + "-" + app + "-" + contract.name) : (org + "-" + contract.name))
    : contract.name

  contract['name'] = tableName
  
  // one from blockapps-rest-plus
  const { chainIds, ...reducedOptions } = options
  const query = {
    owner: `eq.${contract.owner}`,
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

  const results = await rest.searchUntil(admin, contract, predicate, searchOptions)
  return results[0]
}

export const search = async (contractName, args, options, user) => {
  const { queryOptions, limit, offset } = args
  const order = buildOrderQueryOption(args)

  const org = options.org
  const app = options.app == contractName ? undefined : options.app

  const tableName = org ? 
    (app ? (org + "-" + app + "-" + contractName) : (org + "-" + contractName))
    : contractName 

  const tableArgs = {
    name: tableName,
  }

  const searchOptions = {
    ...options,
    query: {
      limit: limit || constants.searchLimit,
      offset: offset || 0,
      ...(order ? { order } : {}),
      ...queryOptions,
    },
  }

  const results = await rest.search(user, tableArgs, searchOptions)
  return results
}

export const searchOne = async (contractName, args, options, user) => {
  const searchArgs = {
    ...args,
    limit: 1,
  }

  const results = await search(contractName, searchArgs, options, user)
  return results[0]
}

export const searchAll = async (contractName, args, options, user) => {
  // if at least one query parameter is defined return one page
  if (args.limit || args.offset) {
    const limit = args.limit && args.limit < constants.searchLimit ? args.limit : constants.searchLimit

    const searchArgs = {
      ...args,
      limit,
    }

    const results = await search(contractName, searchArgs, options, user)
    return results
  }

  // else return all pages
  const searchArgs = {
    ...args,
    limit: constants.searchLimit,
    offset: 0,
  }
  const results = []
  let nextResults = []
  do {
    nextResults = await search(contractName, searchArgs, options, user)
    results.push(...nextResults)
    searchArgs.offset += searchArgs.limit
  } while (nextResults.length && nextResults.length === searchArgs.limit)

  return results
}

export const setSearchQueryOptions = (args = {}, _queryOptionsArray) => {
  const queryOptionsArray = Array.isArray(_queryOptionsArray) ? _queryOptionsArray : [_queryOptionsArray]
  const queryOptions = queryOptionsArray.reduce((agg, cur) => {
    const { key, value, predicate = 'eq' } = cur
    if (!value) {
      return agg
    }
    let option = {}
    if (predicate === 'or') {
      const { subPredicate = 'eq' } = cur
      const valueArray = key.reduce((orAgg, orCur) => {
        orAgg.push(`${orCur}.${subPredicate}.${value}`)
        return orAgg
      }, [])
      option = {
        [predicate]: `(${valueArray.join(',')})`,
      }
    } else {
      option = {
        [key]: `${predicate}.${value}`,
      }
    }
    return {
      ...agg,
      ...option,
    }
  }, {})

  const searchArgs = {
    ...args,
    queryOptions: {
      ...args.queryOptions,
      ...queryOptions,
    },
  }
  return searchArgs
}

export const setSearchQueryOptionsPrime = (args) => {
  const nonQueryOptions = ['queryValue', 'queryFields', 'queryOptions', 'limit', 'offset', 'sort']
  const queryArgs = setSearchQueryOptionsLike(args, Object.keys(args).reduce((result, key) => {
    if (!nonQueryOptions.includes(key)) {
      if (Array.isArray(args[key])) {
        result.push(({ key, value: `(${args[key].join(',')})`, predicate: 'in' }))
      } else {
        result.push(({ key, value: args[key] }))
      }
    }

    if (key === 'queryValue') {
      const { queryValue, queryFields } = args
      if (queryFields) {
        if (Array.isArray(queryFields)) {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'or', subPredicate: 'ilike' })
        } else {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'ilike' })
        }
      }
    }

    if (key === 'sort') {
      result.push(args[key])
    }

    return result
  }, []))
  return queryArgs
}

export const setSearchQueryOptionsLike = (args = {}, _queryOptionsArray) => {
  const queryOptionsArray = Array.isArray(_queryOptionsArray) ? _queryOptionsArray : [_queryOptionsArray]
  const queryOptions = queryOptionsArray.reduce((agg, cur) => {
    let { key, value, predicate = 'like' } = cur
    if (!value) {
      return agg
    }
    if (key == 'and') {
      return {
        ...agg,
        [key]: value
      }
    }
    let dotIndex = value.indexOf('.')
    if (dotIndex >= 0) {
      // split the value on a period, allows to directly pass postgrest operators
      // to this API via ?key=<operator>.<value>
      // and not setting the <operator> will default to the 'like' operator
      // This should only be used for simpler queries not things like 'in' or 'or'
      predicate = value.substring(0, dotIndex)
      value = value.substring(dotIndex + 1) 
    }
    let option = {}
    if (predicate === 'or') {
      const { subPredicate = 'eq' } = cur
      const valueArray = key.reduce((orAgg, orCur) => {
        orAgg.push(`${orCur}.${subPredicate}.${value}`)
        return orAgg
      }, [])
      option = {
        [predicate]: `(${valueArray.join(',')})`,
      }
    } else {
      let searchedValue = value
      if (predicate === 'like') {
        searchedValue = `*${value}*`
      }
      option = {
        [key]: `${predicate}.${searchedValue}`,
      }
    }
    return {
      ...agg,
      ...option,
    }
  }, {})

  const searchArgs = {
    ...args,
    queryOptions: {
      ...args.queryOptions,
      ...queryOptions,
    },
  }
  return searchArgs
}

export const searchAllWithQueryArgsLike = async (contractName, args, options, user) => {
  const nonQueryOptions = ['queryValue', 'queryFields', 'queryOptions', 'limit', 'offset', 'sort']
  const queryArgs = setSearchQueryOptionsLike(args, Object.keys(args).reduce((result, key) => {
    if (!nonQueryOptions.includes(key)) {
      if (Array.isArray(args[key])) {
        result.push(({ key, value: `(${args[key].join(',')})`, predicate: 'in' }))
      } else {
        result.push(({ key, value: args[key] }))
      }
    }

    if (key === 'queryValue') {
      const { queryValue, queryFields } = args
      if (queryFields) {
        if (Array.isArray(queryFields)) {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'or', subPredicate: 'ilike' })
        } else {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'ilike' })
        }
      }
    }

    if (key === 'sort') {
      result.push(args[key])
    }

    return result
  }, []))

  return await searchAll(contractName, queryArgs, options, user)
}

export const searchAllWithQueryArgs = async (contractName, args, options, user) => {
  const nonQueryOptions = ['queryValue', 'queryFields', 'queryOptions', 'limit', 'offset', 'sort']
  const queryArgs = setSearchQueryOptions(args, Object.keys(args).reduce((result, key) => {
    if (!nonQueryOptions.includes(key)) {
      if (Array.isArray(args[key])) {
        result.push(({ key, value: `(${args[key].join(',')})`, predicate: 'in' }))
      } else {
        result.push(({ key, value: args[key] }))
      }
    }

    if (key === 'queryValue') {
      const { queryValue, queryFields } = args
      if (queryFields) {
        if (Array.isArray(queryFields)) {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'or', subPredicate: 'ilike' })
        } else {
          result.push({ key: queryFields, value: `*${queryValue}*`, predicate: 'ilike' })
        }
      }
    }

    if (key === 'sort') {
      result.push(args[key])
    }

    return result
  }, []))

  const results = await searchAll(contractName, queryArgs, options, user)

  return results
}

export const setSearchColumns = (args, _columns) => {
  const columns = Array.isArray(_columns) ? _columns.join(',') : _columns
  const searchArgs = {
    ...args,
    queryOptions: {
      ...args.queryOptions,
      select: columns,
    },
  }
  return searchArgs
}
