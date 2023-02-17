contract ValidationRuleInterface {

  function apply(address contractAddress) public returns (bool, uint, bytes32);

}
