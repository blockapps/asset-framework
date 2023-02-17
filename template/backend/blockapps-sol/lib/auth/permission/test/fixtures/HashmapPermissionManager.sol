import "../../contracts/PermissionManager.sol";

/**
* Hashmap Permission Manager - test a permissioned hashmap
*/
contract HashmapPermissionManager is PermissionManager {

  uint constant MODIFY_MAP = 1234;

  constructor(
    address _owner,
    address _master
  ) public PermissionManager(_owner, _master) {
    // grant here
    grant('admin', msg.sender, MODIFY_MAP);
  }

  // overriding the base function - real check
  function canModifyMap(address _address) returns (bool) {
    uint permissions = MODIFY_MAP;
    return check(_address, permissions) == RestStatus.OK;
  }
}
