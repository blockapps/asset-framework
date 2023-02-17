/**
* Asset Role Enums
*
* #see AssetPermissionManager
* #see AssetRole
* #see AssetPermission 
*
* This basically mirrors the AssetPermission, but you may find that
*  roles mix and match permissions, and so you can create more here
*  
*/

contract AssetRole {
    enum AssetRole {
        NULL,
        ADMIN,
        MAX
    }
}
