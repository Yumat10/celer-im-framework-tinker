// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./GoerliCelerBridge.sol";

contract GoerliCelerBridgeProxy {
    address private goerli_celer_birdge_address;
    address private immutable OWNER_ADDRESS;

    modifier onlyOwner() {
        require(msg.sender == OWNER_ADDRESS, "Only owner");
        _;
    }

    constructor(address _goerli_celer_birdge_address) {
        goerli_celer_birdge_address = _goerli_celer_birdge_address;
        OWNER_ADDRESS = msg.sender;
    }

    function setGoerliCelerBridgeAddress(address _new_address)
        external
        onlyOwner
    {
        goerli_celer_birdge_address = _new_address;
    }

    function goerliToFantomTestnetBridgeProxy(
        address _receiver, // destination contract address
        address _token, // the input token
        uint256 _amount, // the input token amount,
        address originalAddress,
        address[] calldata tos,
        bytes[] memory datas,
        uint256 _value
    ) public payable {
        GoerliCelerBridge bridge = GoerliCelerBridge(
            goerli_celer_birdge_address
        );
        bridge.goerliToFantomTestnetBridge{value: _value}(
            _receiver,
            _token,
            _amount,
            originalAddress,
            tos,
            datas
        );
    }
}
