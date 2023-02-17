import { assert } from 'chai';
import { rest, util } from 'blockapps-rest';
import config from '../../../util/load.config';
import * as unsafeHashmapJs from '../unsafeHashmap';
import { getCredentialArgs } from '../../../util/util';
const { createUser } = rest;

const adminArgs = getCredentialArgs(util.uid(), 'Admin', '1234');

describe('UnsafeHashmap', function () {
  this.timeout(config.timeout)

  const options = { config };
  let admin

  before(async function () {
    console.log('creating admin')
    admin = await createUser(adminArgs, options)
  })

  it('put', async function () {
    const hashmap = await unsafeHashmapJs.uploadContract(admin)
    const iuid = util.iuid()
    const args = factory.createEntity(iuid)
    await hashmap.put(args)
    const state = await hashmap.getState()
    assert.equal(state.values.length, 2, 'length 2')
    assert.equal(parseInt(state.values[1]), parseInt(args.value), 'value')
  })

  it('get', async function () {
    const hashmap = await unsafeHashmapJs.uploadContract(admin)
    const iuid = util.iuid()
    const args = factory.createEntity(iuid)
    await hashmap.put(args)
    const value = await hashmap.get({ key: args.key })
    assert.equal(parseInt(value), parseInt(args.value), 'value')
    const notFound = await hashmap.get({ key: '666' })
    assert.equal(parseInt(notFound), 0, 'not found')
  })

  it('contains', async function () {
    const hashmap = await unsafeHashmapJs.uploadContract(admin)
    const iuid = util.iuid()
    const args = factory.createEntity(iuid)
    await hashmap.put(args)
    const result = await hashmap.contains({ key: args.key })
    assert.equal(result, true, 'contains: true')
    const notFound = await hashmap.contains({ key: '666' })
    assert.equal(notFound, false, 'contains: false')
  })

  it('size', async function () {
    const hashmap = await unsafeHashmapJs.uploadContract(admin)
    const iuid = util.iuid()
    const args = factory.createEntity(iuid)
    await hashmap.put(args)
    const size1 = await hashmap.size({})
    assert.equal(size1, 1, 'size: 1')
    args.key += 'x'
    await hashmap.put(args)
    const size2 = await hashmap.size({})
    assert.equal(size2, 2, 'size: 2')
  })

  it('remove', async function () {
    const hashmap = await unsafeHashmapJs.uploadContract(admin)
    const iuid = util.iuid()
    const count = 5;
    for (let i = 0; i < count; i++) {
      const args = factory.createEntity(iuid * 10 + i)
      await hashmap.put(args)
    }
    const { values } = await hashmap.getState()
    assert.equal(values.length, count + 1, 'length')
    // remove
    {
      const target = 2;
      const args = factory.createEntity(iuid * 10 + target)
      await hashmap.remove({ key: args.key })
      const { values } = await hashmap.getState()
      assert.equal(parseInt(values[target + 1]), 0, 'zero now')
      // get removed element
      const value = await hashmap.get({ key: args.key })
      assert.equal(parseInt(value), 0, 'zero')
      // contains removed element
      const contains = await hashmap.contains({ key: args.key })
      assert.equal(contains, false, 'not contained')
    }
  })
})

const factory = {
  createEntity(iuid) {
    const args = {
      key: `Key_${iuid}`,
      value: iuid,
    }
    return args
  },
}
