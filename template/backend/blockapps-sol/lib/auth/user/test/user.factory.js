const createUserArgs = function (accountAddress, uid, role = 1) {
  const username = `User_${uid}`

  // function User(address _account, string _username, uint _role)
  const args = {
    account: accountAddress,
    username: username,
    role: role,
  };
  return args;
}

export {
  createUserArgs
}
