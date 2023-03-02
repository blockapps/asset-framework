
import "/blockapps-sol/lib/rest/contracts/RestStatus.sol";

/** @dev Importing contracts to be later instantiated on chains via codePtr */
{{#each assets}}
import "/dapp/assets/{{name}}/contracts/{{name}}.sol";
{{/each}}


/**
 * Single entry point to all the project's contracts
 * Deployed by the deploy script
 *
*/

contract MyApp {
  constructor() {
  }
}

contract Dapp {


    event OrgAdded(string orgName);
    event OrgUnitAdded(string orgName, string orgUnit);
    event CommonNameAdded(string orgName, string orgUnit, string commonName); 

    event OrgRemoved(string orgName);
    event OrgUnitRemoved(string orgName, string orgUnit);
    event CommonNameRemoved(string orgName, string orgUnit, string commonName);


    // ---- here are some other managers we have, you can import and use them if you want
    // OrganizationManager organizationManager;
    // AppPermissionManager permissionManager;
    // MembershipManager membershipManager;
    // UserManager userManager;

    account public bootUserAccount;
    string public bootUserCommonName;
    string public bootUserOrganization;
    string public bootUserOrganizationalUnit;



    constructor() public {
        bootUserAccount = account(tx.origin, "main");
        mapping (string => string) userCert = getUserCert(bootUserAccount);
    
        bootUserCommonName = userCert["commonName"];
        bootUserOrganization = userCert["organization"];
        bootUserOrganizationalUnit = userCert["organizationalUnit"];

    }

    function addOrg(string _orgName) {
      assert(msg.sender == address(bootUserAccount));
      emit OrgAdded(_orgName);
    }

    function addOrgUnit(string _orgName, string _orgUnit) {
      assert(msg.sender == address(bootUserAccount));
      emit OrgUnitAdded(_orgName, _orgUnit);
    }

    function addMember(string _orgName, string _orgUnit, string _commonName) { 
      assert(msg.sender == address(bootUserAccount));
      emit CommonNameAdded(_orgName, _orgUnit, _commonName); 
    } 

    function removeOrg(string _orgName) {
      assert(msg.sender == address(bootUserAccount));
      emit OrgRemoved(_orgName);
    }

    function removeOrgUnit(string _orgName, string _orgUnit) {
      assert(msg.sender == address(bootUserAccount));
      emit OrgUnitRemoved(_orgName, _orgUnit);
    }
    
    function removeMember(string _orgName, string _orgUnit, string _commonName) { 
      assert(msg.sender == address(bootUserAccount));
      emit CommonNameRemoved(_orgName, _orgUnit, _commonName);  
    } 

    function addOrgs(string[] _orgNames) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        for (uint256 i = 0; i < _orgNames.length; i++) {
            addOrg(_orgNames[i]);
        }
        return RestStatus.OK;
    }

    function addOrgUnits(string[] _orgNames, string[] _orgUnits) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        require((_orgNames.length == _orgUnits.length), "Input data should be consistent");
        for (uint256 i = 0; i < _orgNames.length; i++) {
            addOrgUnit(_orgNames[i], _orgUnits[i]);
        }
        return RestStatus.OK;
    }

    function addMembers(string[] _orgNames, string[] _orgUnits, string[] _commonNames ) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        require((_orgNames.length == _orgUnits.length && _orgUnits.length == _commonNames.length), "Input data should be consistent");
        for (uint256 i = 0; i < _orgNames.length; i++) {
            addMember(_orgNames[i], _orgUnits[i], _commonNames[i]);
        }
        return RestStatus.OK;
    }

    function removeOrgs(string[] _orgNames) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        for (uint256 i = 0; i < _orgNames.length; i++) {
            removeOrg(_orgNames[i]);
        }
        return RestStatus.OK;
    }

    function removeOrgUnits(string[] _orgNames, string[] _orgUnits) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        require((_orgNames.length == _orgUnits.length), "Input data should be consistent");
        for (uint256 i = 0; i < _orgNames.length; i++) {
            removeOrgUnit(_orgNames[i], _orgUnits[i]);
        }
        return RestStatus.OK;
    }

    function removeMembers(string[] _orgNames, string[] _orgUnits, string[] _commonNames ) public returns (uint256) {
        assert(msg.sender == address(bootUserAccount));
        require((_orgNames.length == _orgUnits.length && _orgUnits.length == _commonNames.length), "Input data should be consistent");
        for (uint256 i = 0; i < _orgNames.length; i++) {
            removeMember(_orgNames[i], _orgUnits[i], _commonNames[i]);
        }
        return RestStatus.OK;
    }
}
