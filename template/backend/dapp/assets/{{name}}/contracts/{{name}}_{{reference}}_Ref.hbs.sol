pragma solidvm 3.4;

import "/blockapps-sol/lib/rest/contracts/RestStatus.sol";

/// @title {{name}} references {{attributes.reference}} in a one-to-many manner.
/// @dev This ref shouldn't be instantiated directly by users. The {{../name}} contract will
/// instantiate it.
contract {{name}}_{{reference}}_Ref {
    address public owner;   // The {{name}} contract that instantiated this contract

    string public {{lower reference}}ChainId;  // ChainId of the {{reference}} contract

    constructor(string _{{lower reference}}ChainId) {
        owner = msg.sender;
        {{lower reference}}ChainId = _{{lower reference}}ChainId;
    }
}
