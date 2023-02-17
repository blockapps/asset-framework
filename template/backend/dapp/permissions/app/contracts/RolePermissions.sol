import "./Permission.sol";
import "./Role.sol";

/**
* App Chain Role Permissions
*
* Mapping of the roles to their respective permissions
*
* #see AppChainPermissionManager
* #see Role
* #see Permission
*
* #return none
*/

contract RolePermissions is Role, Permission {
    uint[] rolePermissions;

    /**
    * Constructor
    */
    constructor() public {
        rolePermissions.length = uint(Role.MAX);
        rolePermissions[uint(Role.NULL)] = 0;
        rolePermissions[uint(Role.MAX)] = 0;

        rolePermissions[uint(Role.GLOBAL_ADMIN)] =
          (1 << uint(Permission.CREATE_ORG)) |
          (1 << uint(Permission.MODIFY_MEMBERSHIP)) |
          (1 << uint(Permission.CREATE_USER)) |
          (1 << uint(Permission.UPDATE_USER));

        rolePermissions[uint(Role.ORG_ADMIN)] =
          (1 << uint(Permission.UPDATE_ORG)) | 
          (1 << uint(Permission.CREATE_USER)) |
          (1 << uint(Permission.UPDATE_USER));
    }

    function getRolePermissions(Role _role) public view returns (uint) {
        // Get Permissions
        return rolePermissions[uint(_role)];
    }
}
