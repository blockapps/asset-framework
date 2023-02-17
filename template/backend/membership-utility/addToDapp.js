import program from 'commander'
import { fsUtil } from 'blockapps-rest'
import config from '../load.config'
import dappJs from '../dapp/dapp/dapp'
import { getMembershipStates } from '../helpers/enums'
import { util } from '../blockapps-rest-plus'

const deploy = fsUtil.getYaml(`${config.configDirPath}/${config.deployFilename}`)
const options = { config }
const getDapp = async () => {
  const applicationUser = await util.getApplicationCredentials()
  const dapp = await dappJs.bind(applicationUser, deploy.dapp.contract, { 
    chainIds: [deploy.dapp.contract.appChainId],
    ...options,
  })
  return dapp
}

program.command('add')
  .option('-o --org <orgName>', 'Organization to Add')
  .option('-ou --orgUnit <orgUnit>', 'Organization Unit to Add')
  .option('-c --commonName <commonName>', 'CommonName to Add')
  .action(async (cmd) => {
    assert.defined(cmd.orgName, 'You must at least provide an orgName (use --org)')
    
    const dapp = await getDapp()
    
    if (cmd.orgUnit) {
      cmd.commonName
        ? await dapp.addMember(cmd.orgName, cmd.orgUnit, cmd.commonName) 
        : await dapp.addOrgUnit(cmd.orgName, cmd.orgUnit)
    else 
      await dapp.addOrg(cmd.orgName)
  })

program.command('remove')
  .option('-o --org <orgName>', 'Organization to Remove')
  .option('-ou --orgUnit <orgUnit>', 'Organization Unit to Remove')
  .option('-c --commonName <commonName>', 'CommonName to Remove')
  .action(async (cmd) => {
    assert.defined(cmd.orgName, 'You must at least provide an orgName (use --org)')
    
    const dapp = await getDapp()
    
    if (cmd.orgUnit) {
      cmd.commonName
        ? await dapp.removeMember(cmd.orgName, cmd.orgUnit, cmd.commonName) 
        : await dapp.removeOrgUnit(cmd.orgName, cmd.orgUnit)
    else 
      await dapp.removeOrg(cmd.orgName)
  })
program.parse(process.argv)
