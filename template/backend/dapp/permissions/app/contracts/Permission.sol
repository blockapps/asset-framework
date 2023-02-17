/**
* App Permissions Enums
*
* Permissions for the roles in the app chain
*
* #see RolePermissions
* #see PermissionManager
*
* #return none
*/

contract Permission {
    enum Permission {
        CREATE_ORG,
        UPDATE_ORG,
        CREATE_USER,
        UPDATE_USER,
        MODIFY_MEMBERSHIP
    }
}
