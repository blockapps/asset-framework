import "./UnsafeHashmap.sol";

/**
 * The Hashmap contract maintains a permissioned implementation
 * of an UnsafeHashmap. All function calls are restricted to the
 * owner of the contract.
 */
contract Hashmap is UnsafeHashmap {
  address public owner;

  function Hashmap() {
    owner = msg.sender;
  }

  function put(string _key, address _value) public {
    if (msg.sender != owner) {
      return;
    }

    return super.put(_key, _value);
  }

  /**
   * @dev        If owner or manager contract is calling function, it will get the value at a key
   *
   * @param      _key    The key
   *
   * @return     returns the address of the contract value
   */
  function get(string _key) public constant returns (address) {
    if (msg.sender != owner) {
      return address(0);
    }

    return super.get(_key);
  }

  /**
   * @dev        If owner or manager contract is calling function, it will check existence of a key/value
   *
   * @param      _key    The key
   *
   * @return     returns a boolean of containment
   */
  function contains(string _key) public constant returns (bool) {
    if (msg.sender != owner) {
      return false;
    }

    return super.contains(_key);    
  }

  /**
   * @dev        If owner or manager contract is calling function, it will return the size of hashmap
   *
   * @return     returns size of hashmap
   */
  function size() public constant returns (uint) {
    if (msg.sender != owner) {
      return 0;
    }

    return super.size();
  }

  /**
   * @dev        Allows the current owner to transfer control of the contract to a newOwner.
   *
   * @param      _newOwner   The address to transfer ownership to.
   *
   * @return     returns status of ownership transfer
   */
  function transferOwnership(address _newOwner) public returns (bool) {
    if (msg.sender != owner) {
      return false;
    }

    owner = _newOwner;
    return true;
  }

  function getOwner() public constant returns (address) {
    return owner;
  }
}
