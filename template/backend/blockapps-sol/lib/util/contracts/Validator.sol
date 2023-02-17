/**
 * Validator contract
 */
contract Validator {
  function isEmptyString(string _s) public returns (bool) {
    return  bytes(_s).length == 0;
  }

  function isEmptyAddress(address _a) public returns (bool) {
    return  _a == 0;
  }

  function isEmptyIntArray(uint[] _arr) public returns (bool) {
    return _arr.length == 0;
  }

  function isEmptyByteArray(bytes32[] _arr) public returns (bool) {
    return _arr.length == 0;
  }

  function isEmptyByte(bytes32 _bytes) public returns (bool) {
    return _bytes == 0;
  }

}
