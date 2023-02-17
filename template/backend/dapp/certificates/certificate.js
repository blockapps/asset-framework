import config from "/load.config"
import constants from '/helpers/constants'
import { setSearchQueryOptions, searchOne, searchAllWithQueryArgs } from '/helpers/utils'

// Utility functions for getting Certificates from the CertRegistry Dapp on the main chain in Mercata
const defaultOptions = { config }

async function getCertificate(admin, args = {}, options = defaultOptions) {
    const parsedArgs = Object.entries(args).map(([key, value]) => {
        return { key, value }
    })
    
    const searchArgs = setSearchQueryOptions({}, parsedArgs)
    const user = await searchOne(constants.certificateContractName, searchArgs, options, admin)
    
    if (!user) {
        return undefined
    }
    
    return user
}

async function getCertificateMe(admin, options = defaultOptions) {
    const me = await getCertificate(admin, {userAddress: admin.address}, options)
    return me;
}

async function getCertificates(admin, args = {}, options = defaultOptions) {
    const certs = await searchAllWithQueryArgs(constants.certificateContractName, args, options, admin)
    return certs
}

export default {
    getCertificate,
    getCertificateMe,
    getCertificates,
}