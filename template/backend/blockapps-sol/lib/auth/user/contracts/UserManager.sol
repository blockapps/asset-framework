import "./User.sol";
import "../../../rest/contracts/RestStatus.sol";
import "../../../collections/hashmap/contracts/Hashmap.sol";

/**
* Interface for Gas Deal data contracts
*/

/**
* Interface for User data contracts
*/
contract UserManager is RestStatus, Util {
  // owner of the contract
  address owner;
  // users array
  Hashmap users;

  /**
  * Constructor
  */
  function UserManager(address _owner) {
    owner = _owner;
    users = new Hashmap();
  }

  function exists(string _username) returns (bool) {
    return users.contains(_username);
  }

  function getUser(string _username) returns (address) {
    return users.get(_username);
  }

  function createUser(
    address _account,
    string _username,
    uint _role) returns (uint, address) {
    // only owner can execute
    if (msg.sender != owner) {
      return (RestStatus.UNAUTHORIZED, 0);
    }

    // name must be <= 32 bytes
    if (bytes(_username).length > 32) return (RestStatus.BAD_REQUEST, 0);
    // fail if username exists
    if (exists(_username)) return (RestStatus.BAD_REQUEST, 0);
    // add user
    User user = new User(_account, _username, _role);
    users.put(_username, user);
    return (RestStatus.CREATED, user);
  }

}
