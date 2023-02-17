import "../../../util/contracts/Util.sol";

contract UnsafeHashmap is Util {

  address[] public values;
  string[] public keys;
  bool public isIterable; // save the keys
  /*
    note on mapping to array index:
    a non existing mapping will return 0, so 0 should not be a valid value in a map,
    otherwise exists() will not work
  */
  mapping (bytes32 => uint) keyMap;

  function UnsafeHashmap() {
    values.length = 1; // see above note
    keys.length = 1; // see above note
    isIterable = false; // not saving keys, to conserve space
  }

  function put(string _key, address _value) public {
    // save the value
    keyMap[keccak256(_key)] = values.length;
    values.push(_value);
    // save the key if isIterable
    if (isIterable) {
      keys.push(_key);
    }
  }

  function get(string _key) public constant returns (address) {
    uint index = keyMap[keccak256(_key)];
    return values[index];
  }

  function contains(string _key) public constant returns (bool) {
    uint index = keyMap[keccak256(_key)];
    return values[index] != 0;
  }

  function size() public constant returns (uint) {
    return values.length -1; // not counting entry 0
  }

  function remove(string _key) public {
    uint index = keyMap[keccak256(_key)];
    if (index == 0) return;
    // remove the index mapping
    keyMap[keccak256(_key)] = 0;
    // remove the value
    values[index] = 0;
    // remove the key
    if (isIterable) {
      delete keys[index];
    }
  }
}
