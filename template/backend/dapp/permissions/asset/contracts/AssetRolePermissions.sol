import "./AssetPermission.sol";
import "./AssetRole.sol";

/**
* Asset Role Permissions
*
* Mapping of the roles to their respective permissions
*
* #see AssetPermissionManager
* #see AssetRole
* #see AssetPermission
*
* #return none
*/

contract AssetRolePermissions is AssetRole, AssetPermission {
    uint[] rolePermissions;

    /**
    * Constructor
    */
    constructor() public {
        rolePermissions.length = uint(AssetRole.MAX);
        rolePermissions[uint(AssetRole.NULL)] = 0;
        rolePermissions[uint(AssetRole.MAX)] = 0;

        // Assigning permissions to roles
        rolePermissions[uint(AssetRole.ADMIN)] =
            (1 << uint(AssetPermission.ASSET_ADMIN));

    }

    function getRolePermissions(AssetRole _role) public view returns (uint) {
        // Get Permissions
        return rolePermissions[uint(_role)];
    }
}
