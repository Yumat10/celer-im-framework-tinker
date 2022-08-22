// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./GoerliCelerBridge.sol";

contract GoerliCelerBridgeProxy {
    address payable public goerli_celer_bridge_address;
    address private immutable OWNER_ADDRESS;

    modifier onlyOwner() {
        require(msg.sender == OWNER_ADDRESS, "Only owner");
        _;
    }

    constructor(address _goerli_celer_bridge_address) {
        goerli_celer_bridge_address = payable(_goerli_celer_bridge_address);
        OWNER_ADDRESS = msg.sender;
    }

    function setGoerliCelerBridgeAddress(address _new_address)
        external
        onlyOwner
    {
        goerli_celer_bridge_address = payable(_new_address);
    }

    // function goerliToFantomTestnetBridgeProxy(
    //     address _receiver, // destination contract address
    //     address _token, // the input token
    //     uint256 _amount, // the input token amount,
    //     address originalAddress,
    //     address[] calldata tos,
    //     bytes[] memory datas,
    //     uint256 _value
    // ) public {
    //     GoerliCelerBridge bridge = GoerliCelerBridge(
    //         goerli_celer_bridge_address
    //     );
    //     bridge.goerliToFantomTestnetBridge{value: _value}(
    //         _receiver,
    //         _token,
    //         _amount,
    //         originalAddress,
    //         tos,
    //         datas
    //     );
    // }

    receive() external payable {} 
}
