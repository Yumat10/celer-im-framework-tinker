// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "sgn-v2-contracts/contracts/message/libraries/MessageSenderLib.sol";
import "sgn-v2-contracts/contracts/message/libraries/MsgDataTypes.sol";
import "sgn-v2-contracts/contracts/message/interfaces/IMessageReceiverApp.sol";

import "../interfaces/IUniswapV2Router02.sol";

contract GoerliCelerBridge {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct ExecsRequest {
        address originalAddress;
        address[] tos;
        bytes[] datas;
    }

    uint64 nonce;
    address messageBus;
    address immutable GOERLI_CELER_BRIDGE;

    event test_event(uint256);
    event goerli_fantom_testnet_bridge(address indexed originalAddress, address indexed contract_address, address message_bus, uint256 value);

    constructor(address _messageBus) {
        messageBus = _messageBus;
        GOERLI_CELER_BRIDGE = address(this);
    }

    function testFunc(uint256 _testValue) external {
        emit test_event(_testValue);
    }

    function goerliToFantomTestnetBridge(
        address _receiver, // destination contract address
        address _token, // the input token
        uint256 _amount, // the input token amount,
        address _message_bus,
        address originalAddress,
        address[] calldata tos,
        bytes[] memory datas
    ) public payable {
        // Each transfer is assigned a nonce
        nonce += 1;

        // Pull funds from the sender
        IERC20(_token).safeTransferFrom(
            originalAddress,
            address(this),
            _amount
        );

        bytes memory message = abi.encode(
            ExecsRequest({
                originalAddress: originalAddress,
                tos: tos,
                datas: datas
            })
        );

        // Send the message
        MessageSenderLib.sendMessageWithTransfer(
            _receiver,
            _token,
            _amount,
            4002, // FTM Testnet
            nonce,
            1000000, // 100% Slippage since testnet pools tend to be imbalanced
            message,
            MsgDataTypes.BridgeSendType.Liquidity, // Pool-based liquidity bridge,
            _message_bus,
            msg.value
        );

        emit goerli_fantom_testnet_bridge(originalAddress, address(this), messageBus, msg.value);
    }

    receive() external payable {} 
}
