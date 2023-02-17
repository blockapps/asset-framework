import { assert } from 'chai';
import { rest, util } from 'blockapps-rest';
const { createUser } = rest;

import config from '../../../util/load.config';
import { uploadContract } from '../userManager';
import { createUserArgs } from './user.factory';
import { getCredentialArgs } from '../../../util/util';

const adminArgs = getCredentialArgs(util.uid(), 'Admin', '1234');

describe('UserManager LOAD tests', function () {
  this.timeout(config.timeout);

  const count = util.getArgInt('--count', 4);
  const options = { config }

  let admin;
  let contract;

  // get ready:  admin-user and manager-contract
  before(async function () {
    admin = await createUser(adminArgs, options);
    contract = await uploadContract(admin);
  });

  it('User address leading zeros - load test - count:' + count, async function () {
    this.timeout(60 * 60 * 1000);

    const users = [];
    const uid = util.uid() * 100;
    const accountAddress = 1234500;
    // create users
    for (let i = 0; i < count; i++) {
      const args = createUserArgs(accountAddress + i, uid + i);
      const user = await contract.createUser(args);
      users.push(user);
    }

    // get single user
    for (let user of users) {
      const resultUser = await contract.getUser(user.username);
    }

    // get all users
    const resultUsers = await contract.getUsers(admin, contract);
    const comparator = function (a, b) { return a.username == b.username; };
    const notFound = filter_isContained(users, resultUsers, comparator);
    assert.equal(notFound.length, 0, JSON.stringify(notFound));
  });
});

function filter_isContained(setA, setB, comparator, isDebug) {
  if (isDebug) {
    console.log('setA', setA);
    console.log('setB', setB);
  }
  return setA.filter(function (memberA) {
    return !setB.filter(function (memberB) {
      // compare
      return comparator(memberA, memberB);
    }).length > 0; // some items were found in setA that are not included in setB
  });
}