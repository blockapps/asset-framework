import "/blockapps-sol/lib/auth/permission/contracts/PermissionManager.sol";
import "/blockapps-sol/lib/rest/contracts/RestStatus.sol";

import "./AssetPermission.sol";
import "./AssetRolePermissions.sol";
import "./AssetRole.sol";

contract AssetPermissionManager is RestStatus, PermissionManager, AssetPermission, AssetRolePermissions {
    /**
    * Constructor
    */
    constructor(address _admin, address _master)
    public
    PermissionManager(_admin, _master) {}

    function grantRole(string _id, address _address, AssetRole _role) public returns (uint, uint) {
        // Get permission for a role
        uint permissions = getRolePermissions(_role);
        // Get current user permissions
        var (restStatus, userPermissions) = getPermissions(_address);
        if (restStatus == RestStatus.OK) {
            if (userPermissions > 0) {
                return (RestStatus.CONFLICT, userPermissions);
            }
        }
        // Grant role to a user
        if (permissions == 0) {
            return (RestStatus.OK, userPermissions);
        }
        return grant(_id, _address, permissions);
    }

    function revoke(address _address) public returns (uint) {
        return super.revoke(_address);
    }

    function canUpdateAsset(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(AssetPermission.ASSET_ADMIN);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }

    function canTransferAsset(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(AssetPermission.ASSET_ADMIN);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }
}
