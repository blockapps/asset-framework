import { assert } from 'chai';
import { rest, util, fsUtil, parser } from 'blockapps-rest';
const { createUser, call } = rest;

import config from '../../../util/load.config';
import * as permissionManagerJs from '../permissionManager';
import { getCredentialArgs } from '../../../util/util';

const adminArgs = getCredentialArgs(util.uid(), 'Admin', '1234');
const masterArgs = getCredentialArgs(util.uid(), 'Master', '5678');

describe('PermissionManager tests', function () {
  this.timeout(config.timeout);
  
  const options = { config }

  let admin, master, EventLogType, RestStatus;

  // get ready:  admin-user and manager-contract
  before(async function () {
    // Parse fields
    const restStatusSource = fsUtil.get(`${util.cwd}/${config.libPath}/rest/contracts/RestStatus.sol`)
    RestStatus = await parser.parseFields(restStatusSource);

    // parse Enums
    const source = fsUtil.get(`${util.cwd}/${config.libPath}/auth/permission/contracts/EventLogType.sol`)
    EventLogType = await parser.parseEnum(source);

    console.log('creating admin')
    admin = await createUser(adminArgs, options)
    console.log('creating master')
    master = await createUser(masterArgs, options)
  })

  it('upload', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)
    const { eventLog } = await contract.getState()
    assert.isDefined(eventLog, 'eventLog')
    assert.equal(eventLog.length, 0, 'empty')
  })

  it('Grant (address with permissions)', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const args = await createPermitArgs(uid)
    const permissions = await contract.grant(args)
    assert.equal(permissions, args.permissions, 'permissions added')
    const state = await contract.getState()
    const permit = state.permits[1]
    assert.equal(permit.adrs, args.address, ' address in array')
    assert.equal(permit.permissions, args.permissions, ' permissions in array')
    assert.equal(permit.id, args.id, 'id in array')
  })

  it('Grant Multiple Permissions', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const args = await createPermitArgs(uid)
    // add permit
    {
      const permissions = await contract.grant(args)
      assert.equal(permissions, args.permissions, 'permissions added')
    }
    // add different permission
    {
      args.permissions = 0x30
      const permissions = await contract.grant(args)
      const expected = 0x30 | 0x03
      assert.equal(permissions, expected, 'permissions added')
    }
  })

  it('Get permit', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    const args = { address: permitArgs.address }
    const permissions = await contract.getPermissions(args)
    assert.equal(permissions, permitArgs.permissions, 'permissions')
    {
      permitArgs.permissions = 0x30
      await contract.grant(permitArgs)
      const permissions2 = await contract.getPermissions(args)
      const expected = 0x03 | 0x30
      assert.equal(permissions2, expected, 'new permissions')
    }
  })

  it('Get permit 404', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const args = { address: 1234 }
    try {
      await contract.getPermissions(args)
    } catch (e) {
      assert.equal(e.response.status, RestStatus.NOT_FOUND, 'should Throws 404 Not found')
    }
  })

  it.skip('Get permit - history', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    // found
    {
      const args = { address: permitArgs.address }
      const permissions = await contract.getPermissions(args)
      assert.equal(permissions, permitArgs.permissions, 'permissions')
    }
    // not found
    {
      const args = { address: uid }
      await assert.shouldThrowRest(async function () {
        const permissions = await contract.getPermissions(args)
      }, RestStatus.NOT_FOUND)
    }
    // check the history
    const { history } = await contract.getState()
    assert.equal(history[0], permitArgs.address, 'valid call')
    assert.equal(history[1], uid, 'valid call')
  })

  it('Check permissions', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    // check
    const args = { address: permitArgs.address, permissions: permitArgs.permissions }
    const isPermitted = await contract.check(args)
    assert.equal(isPermitted, true, 'permitted')
    {
      const args = { address: permitArgs.address, permissions: 0xFF }
      const isPermitted = await contract.check(args)
      assert.equal(isPermitted, false, 'NOT permitted')
    }
  })

  it('Revoke permissions', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    // get permissions
    const args = { address: permitArgs.address }
    const permissions = await contract.getPermissions(args)
    assert.equal(permissions, permitArgs.permissions, 'permissions')
    // revoke
    {
      const args = { address: permitArgs.address }
      await contract.revoke(args)
    }
    // get permissions
    {
      const args = { address: permitArgs.address }
      const permissions = await contract.getPermissions(args)
      assert.equal(permissions, 0, 'no permissions')
    }
  })

  it('Revoke - 404', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const args = { address: 1234 }
    
    try {
      await contract.revoke(args)
    } catch (e) {
      assert.equal(e.response.status, RestStatus.BAD_REQUEST, 'should throws 404 Not found')
    }
  })

  it('Transfer Ownership - AUTHORIZED', async function () {
    const uid = util.uid()
    const newOwner = await createUser({ username: `NewOwner_${uid}`, password: '1234' }, options)
    const contract = await permissionManagerJs.uploadContract(admin, master)
    // transfer ownership to a new admin, by the master
    {
      const callArgs = {
        contract,
        method: 'transferOwnership',
        args: util.usc({ newOwner: newOwner.address })
      }

      const [restStatus] = await call(master, callArgs, options)
      assert.equal(restStatus, RestStatus.OK, 'should succeed')
    }
  })

  it('Transfer Ownership - positive case', async function () {
    const uid = util.uid()
    const newOwner = await createUser({ username: `NewOwner_${uid}`, password: '1234' }, options)
    const contract = await permissionManagerJs.uploadContract(admin, master)
    // admin works
    const args = await createPermitArgs(uid)
    await contract.grant(args)
    // new admin unauthorized
    {
      const callArgs = {
        contract,
        method: 'grant',
        args: util.usc(args)
      }
      const [restStatus, permissions] = await call(newOwner, callArgs, options)
      assert.equal(restStatus, RestStatus.UNAUTHORIZED, 'should fail')
    }
    // transfer ownership - must be master
    {
      const args = { newOwner: newOwner.address }
      const callArgs = {
        contract,
        method: 'transferOwnership',
        args: util.usc(args)
      }

      const [restStatus] = await call(master, callArgs, options)
      assert.equal(restStatus, RestStatus.OK, 'should succeed')
    }
    // old admin unauthorized
    {
      const callArgs = {
        contract,
        method: 'grant',
        args: util.usc(args)
      }

      const [restStatus] = await call(admin, callArgs, options)
      assert.equal(restStatus, RestStatus.UNAUTHORIZED, 'should fail')
    }
    // new admin works
    {
      const callArgs = {
        contract,
        method: 'grant',
        args: util.usc(args)
      }

      const [restStatus] = await call(newOwner, callArgs, options)
      assert.equal(restStatus, RestStatus.OK, 'should succeed')
    }
  })

  it('Transfer Ownership - UNAUTHORIZED', async function () {
    const uid = util.uid()
    const contract = await permissionManagerJs.uploadContract(admin, master)
    // transfer ownership to attacker
    {
      const attacker = await createUser({ username: `Attacker_${uid}`, password: '1234' }, options)
      const args = { newOwner: attacker.address }

      const callArgs = {
        contract,
        method: 'transferOwnership',
        args: util.usc(args)
      }

      const [restStatus] = await call(attacker, callArgs, options)
      assert.equal(restStatus, RestStatus.UNAUTHORIZED, 'should fail')
    }
  })

  it('EventLog - Check permissions', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    // check OK - should not be logged
    {
      const args = { address: permitArgs.address, permissions: permitArgs.permissions }
      await contract.check(args)
      // event log
      const { eventLog } = await contract.getState()
      assert.equal(eventLog.length, 1, 'not logged')
    }
    // check unauthorized
    {
      const args = { address: permitArgs.address, permissions: 0x8 }
      await contract.check(args)
      // event log
      const { eventLog } = await contract.getState()
      assert.equal(eventLog.length, 2, 'one entry')
      const eventLogEntry = eventLog[1];
      assert.equal(eventLogEntry.msgSender, admin.address, 'msg sender')
      assert.isDefined(eventLogEntry.blockTimestamp, 'timestamp')
      assert.equal(eventLogEntry.eventType, EventLogType.CHECK, 'type')
      assert.equal(eventLogEntry.id, '', 'id')
      assert.equal(eventLogEntry.adrs, args.address, 'address')
      assert.equal(eventLogEntry.permissions, args.permissions, 'permissions')
      assert.equal(eventLogEntry.result, RestStatus.UNAUTHORIZED, 'result')
    }
  })

  it('EventLog - Grant', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const args = await createPermitArgs(uid)
    await contract.grant(args)
    // event log
    const { eventLog } = await contract.getState()
    assert.equal(eventLog.length, 1, 'one entry')
    const eventLogEntry = eventLog[0];
    assert.equal(eventLogEntry.msgSender, admin.address, 'msg sender')
    assert.isDefined(eventLogEntry.blockTimestamp, 'timestamp')
    assert.equal(eventLogEntry.eventType, EventLogType.GRANT, 'type')
    assert.equal(eventLogEntry.id, args.id, 'id')
    assert.equal(eventLogEntry.adrs, args.address, 'address')
    assert.equal(eventLogEntry.permissions, args.permissions, 'permissions')
    assert.equal(eventLogEntry.result, RestStatus.OK, 'result')
  })

  it('EventLog - Revoke', async function () {
    const contract = await permissionManagerJs.uploadContract(admin, master)

    const uid = util.uid()
    const permitArgs = await createPermitArgs(uid)
    await contract.grant(permitArgs)
    // revoke
    {
      const args = { address: permitArgs.address }
      await contract.revoke(args)
    }
    // event log
    const { eventLog } = await contract.getState()
    assert.equal(eventLog.length, 2, 'two entries')
    const eventLogEntry = eventLog[1];
    assert.equal(eventLogEntry.msgSender, admin.address, 'msg sender')
    assert.isDefined(eventLogEntry.blockTimestamp, 'timestamp')
    assert.equal(eventLogEntry.eventType, EventLogType.REVOKE, 'type')
    assert.equal(eventLogEntry.id, '', 'id')
    assert.equal(eventLogEntry.adrs, permitArgs.address, 'address')
    assert.equal(eventLogEntry.permissions, 0, 'permissions')
    assert.equal(eventLogEntry.result, RestStatus.OK, 'result')
  })
})


async function createPermitArgs(uid) {
  const userArgs = {
    username: `username_${uid}`,
    password: '1234'
  };

  const user = await createUser(userArgs, { config })
  const permissions = 0x3

  const args = {
    id: `ID_${uid}`,
    address: user.address,
    permissions,
  }
  return args
}
