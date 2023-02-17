import "/blockapps-sol/lib/auth/permission/contracts/PermissionManager.sol";
import "/blockapps-sol/lib/rest/contracts/RestStatus.sol";

import "./Permission.sol";
import "./RolePermissions.sol";
import "./Role.sol";

/**
* App Chain Permissions Manager
*
* Entry point to grant and revoke permissions for a user on the app chain. Also check whether a
* user has permission to perform a particular actions or not.
*
* #see RolePermission
* #see Role
* #see Permission
*
* #return none
*/

contract AppPermissionManager is RestStatus, PermissionManager, Permission, RolePermissions {
    /**
    * Constructor
    */
    constructor(address _admin, address _master)
    public
    PermissionManager(_admin, _master) {}

    function grantRole(string _id, address _address, Role _role) public returns (uint, uint) {
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

    function canModifyMembership(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(Permission.MODIFY_MEMBERSHIP);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }

    function canCreateOrganization(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(Permission.CREATE_ORG);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }

    function canUpdateOrganization(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(Permission.UPDATE_ORG);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }

    function canCreateUser(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(Permission.CREATE_USER);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }

    function canUpdateUser(address _address) public returns (bool) {
        // Get permission
        uint permissions = 1 << uint(Permission.UPDATE_USER);
        // Check permission
        return check(_address, permissions) == RestStatus.OK;
    }
}
