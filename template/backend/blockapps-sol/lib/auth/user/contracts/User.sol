
/**
 * User data contract
 */
contract User {
  address public account;
  string public username;
  uint public role;

  // internal
  uint public updateCounter = 0;

  function User(address _account, string _username, uint _role) {
    account = _account;
    username = _username;
    role = _role;
    updateCounter = 1; // set update counter
  }

}
