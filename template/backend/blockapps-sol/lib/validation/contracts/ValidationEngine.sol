import "./ValidationRuleInterface.sol";
import "./ValidationStatus.sol";
import "../../rest/contracts/RestStatus.sol";

contract ValidationEngine is RestStatus, ValidationStatus {

  mapping (bytes32 => bytes32[]) ruleNames;
  mapping (bytes32 => mapping(bytes32 => mapping(bool => ValidationRuleInterface))) public ruleSets;

  function addRule(bytes32 profileName, bytes32 ruleName, ValidationRuleInterface ruleContractAddress) public {
    ruleSets[profileName][ruleName][true] = ruleContractAddress;

    bytes32[] names = ruleNames[profileName];
    names.push(ruleName);
    ruleNames[profileName] = names;
  }

  function deactivateRule(bytes32 profileName, bytes32 ruleName) public {
    ruleSets[profileName][ruleName][false] = ruleSets[profileName][ruleName][true];
    ruleSets[profileName][ruleName][true]  = ValidationRuleInterface(0);
  }

  function activateRule(bytes32 profileName, bytes32 ruleName) public {
    ruleSets[profileName][ruleName][true]  = ruleSets[profileName][ruleName][false];
    ruleSets[profileName][ruleName][false] = ValidationRuleInterface(0);
  }

  function validate(address contractAddress, bytes32 profileName) public returns (uint, uint, bool, bytes32) {
    bytes32[] names = ruleNames[profileName];
    if(names.length == 0) {
      return (RestStatus.NOT_FOUND, ValidationStatus.PROFILE_INVALID, false, "Profile Not Found");
    }
    for(uint i = 0; i < names.length; i++) {
      address temp = ruleSets[profileName][names[i]][true];
      if (temp == 0x0) {
        continue;
      }
      ValidationRuleInterface rule = ValidationRuleInterface(temp);
      var (isValid, status, message) = rule.apply(contractAddress);
      if (!isValid) {
        return (RestStatus.OK, status, false, message);
      }
    }
    return (RestStatus.OK, ValidationStatus.VALIDATION_PASSED, true, "Validations Passed");
  }
}
