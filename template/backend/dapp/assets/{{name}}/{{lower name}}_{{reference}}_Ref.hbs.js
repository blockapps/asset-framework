import { util, rest, importer } from '/blockapps-rest-plus';
import config from '/load.config';
import { setSearchQueryOptions, searchOne, searchAll } from '/helpers/utils';

const contractName = '{{name}}_{{reference}}_Ref';
const contractFilename = `${util.cwd}/dapp/assets/{{name}}/contracts/{{name}}_{{reference}}_Ref.sol`;

/**
 * @file Create a new {{name}}_{{reference}}_Ref via a contract upload. Used solely for unit testing in
 * {{name}}_{{reference}}_Ref.test.js.
 */

/** 
 * Upload a new {{name}}_{{reference}}_Ref 
 * @param user User token (typically an admin)
 * @param _constructorArgs Arguments of {{name}}_{{reference}}_Ref's constructor
 * @param options Deployment options (found in _/config/*.config.yaml_ via _load.config.js_) 
 * @returns Contract object
 * */
async function uploadContract(user, _constructorArgs, options) {
    const constructorArgs = marshalIn(_constructorArgs);

    const contractArgs = {
        name: contractName,
        source: await importer.combine(contractFilename),
        args: util.usc(constructorArgs),
    };

    const contract = await rest.createContract(user, contractArgs, options);
    contract.src = 'removed';

    return bind(user, contract, options);
}

/**
 * Augment contract arguments before they are used to post a contract.
 * Its counterpart is {@link marshalOut `marshalOut`}.
 * 
 * As our arguments come into the {{name}}_{{reference}}_Ref contract they first pass through `marshalIn` and 
 * when we retrieve contract state they pass through {@link marshalOut `marshalOut`}.
 * 
 * (A mathematical analogy: `marshalIn` and {@link marshalOut `marshalOut`} form something like a 
 * homomorphism) 
 * @param args - Contract state 
 */
function marshalIn(_args) {
    const args = {
        ..._args,
    };
    return args;
}

/**
 * Augment returned contract state before it is returned.
 * Its counterpart is {@link marshalIn `marshalIn`}.
 * 
 * As our arguments come into the {{name}}_{{reference}}_Ref contract they first pass through {@link marshalIn `marshalIn`} 
 * and when we retrieve contract state they pass through `marshalOut`.
 * 
 * (A mathematical analogy: {@link marshalIn `marshalIn`} and `marshalOut` form something like a 
 * homomorphism) 
 * @param _args - Contract state
 */
function marshalOut(_args) {
    const args = {
        ..._args,
    };
    return args;
}

/**
 * Bind functions relevant for {{name}}_{{reference}}_Ref to the _contract object. 
 * @param user User token
 * @param _contract Contract object from `rest.createContract()` etc.
 * @param options Deployment options (found in _/config/*.config.yaml_ via _load.config.js_)
 */
function bind(user, _contract, options) {
    const contract = { ..._contract };

    contract.get = async (args = { address: contract.address, }) => get(user, args, options);
    contract.getState = async () => getState(user, contract, options);

    return contract;
}

/** 
 * Bind an existing {{name}}_{{reference}}_Ref contract to a new user token. Useful for having multiple users test
 * the same contract.
 * @example <caption>Create an admin and user bound to the same new {{name}}_{{reference}}_Ref contract.</caption>
 * const adminBoundContract = uploadContract(adminToken, args, options);
 * const userBoundContract = bindAddress(userToken, adminBoundContract.address, options);
 * @param user User token
 * @param address Address of the {{name}}_{{reference}}_Ref contract
 * @param options Deployment options (found in _/config/*.config.yaml_ via _load.config.js_)
 */
function bindAddress(user, address, options) {
    const contract = {
        name: contractName,
        address,
    };
    return bind(user, contract, options);
}

/**
 * Get contract state via cirrus. A proper chainId is typically already provided in options.
 * @param args Lookup with an address.
 * @returns Contract state in cirrus
 */
async function get(user, args, options) {
    const { address, ...restArgs } = args;
    let {{name}}_{{reference}}_Ref;

    if (address) {
        const searchArgs = setSearchQueryOptions(restArgs, { key: 'address', value: address });
        {{name}}_{{reference}}_Ref = await searchOne(contractName, searchArgs, options, user);
    }
    if (!{{name}}_{{reference}}_Ref) {
        return undefined;
    }

    return marshalOut({{name}}_{{reference}}_Ref);
}

/**
 * Get contract state in bloc.
 * @deprecated Use {@link get `get`} instead.
 */
async function getState(user, contract, options) {
    const state = await rest.getState(user, contract, options);
    return marshalOut(state);
}

/**
 * Get all the ref contracts for a particular {{name}}
 * This function is not present in bind
 * @param args Lookup with an address
 * @returns All the ref contracts in a list for a particular {{name}}
 */
 async function getAllBy{{name}}Address(user, args, options) {
    const { address, ...restArgs } = args;
    let {{name}}_{{reference}}_Refs;

    if (address) {
        const byOwner = setSearchQueryOptions(restArgs, { key: 'owner', value: address });
        {{name}}_{{reference}}_Refs = await searchAll(contractName, byOwner, options, user);
    }
    if (!{{name}}_{{reference}}_Refs) {
        return undefined;
    }

    return {{name}}_{{reference}}_Refs.map(ref => marshalOut(ref));
}

export default {
    uploadContract,
    contractName,
    contractFilename,
    getAllBy{{name}}Address,
    bindAddress,
    marshalIn,
    marshalOut,
}
