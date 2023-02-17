import { assert } from 'chai';
import { rest, util } from 'blockapps-rest';
import config from '../../../util/load.config';
import * as hashmapJs from '../hashmap';
import { getCredentialArgs } from '../../../util/util';
const { createUser } = rest;

const adminArgs = getCredentialArgs(util.uid(), 'Admin', '1234');
const otherAdminArgs = getCredentialArgs(util.uid(), 'OtherAdmin', '5678');

describe('Hashmap', function () {
  this.timeout(config.timeout);

  const options = { config };
  let admin;
  let otherAdmin;

  before(async function () {
    console.log('creating admin')
    admin = await createUser(adminArgs, options);
    console.log('creating user')
    otherAdmin = await createUser(otherAdminArgs, options);
  });

  it('getOwner', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const owner = await hashmap.getOwner({});
    assert.equal(owner.toString(), admin.address);
  });

  it('put', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    const state = await hashmap.getState();
    assert.equal(state.values.length, 2, 'length 2');
    assert.equal(parseInt(state.values[1]), parseInt(args.value), 'value');
  });

  it('get', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    const value = await hashmap.get({ key: args.key });
    assert.equal(parseInt(value), parseInt(args.value), 'value');
    const notFound = await hashmap.get({ key: '666' });
    assert.equal(parseInt(notFound), 0, 'not found');
  });

  it('contains', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    const result = await hashmap.contains({ key: args.key });
    assert.equal(result, true, 'contains: true');
    const notFound = await hashmap.contains({ key: '666' });
    assert.equal(notFound, false, 'contains: false');
  });

  it('size', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    const size1 = await hashmap.size({});
    assert.equal(size1, 1, 'size: 1');
    args.key += 'x';
    await hashmap.put(args);
    const size2 = await hashmap.size({});
    assert.equal(size2, 2, 'size: 2');
  });

  it('transferOwnership to otherAdmin', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });
    const owner = await hashmap.getOwner({});
    assert.notEqual(owner.toString(), admin.address);
    assert.equal(owner.toString(), otherAdmin.address);
  });

  it('reject get from original admin', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });

    const result = await hashmap.get({ key: args.key });
    assert.equal(result.toString(), "0000000000000000000000000000000000000000");
  });

  it('reject put from original admin', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);

    await hashmap.put(args);
    const result = await hashmapJs.get(otherAdmin, hashmap, { key: args.key })
    assert.equal(result.toString(), "0000000000000000000000000000000000000000");

    const result2 = await hashmapJs.size(otherAdmin, hashmap, { key: args.key })
    assert.equal(result2, 0);
  });

  it('reject contains from original admin', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });

    const result = await hashmap.contains({ key: args.key });
    assert.equal(result, false);
  });

  it('reject size from original admin', async function () {
    const hashmap = await hashmapJs.uploadContract(admin);
    const iuid = util.iuid();
    const args = factory.createEntity(iuid);
    await hashmap.put(args);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });

    const result = await hashmap.size({});
    assert.equal(result, 0)
  });

  it('reject transferOwnership from original admin', async function () {
    const newAdmin = await createUser({ username: util.uid('newAdmin'), password: '4321' }, options);
    const hashmap = await hashmapJs.uploadContract(admin);
    await hashmap.transferOwnership({ newOwner: otherAdmin.address });

    const result = await hashmap.transferOwnership({ newOwner: newAdmin.address });
    assert.equal(result, false);
  });
});

const factory = {
  createEntity: factory_createEntity,
};

function factory_createEntity(iuid) {
  const args = {
    key: 'Key_' + iuid,
    value: iuid,
  };
  return args;
}
