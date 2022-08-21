// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "sgn-v2-contracts/contracts/message/libraries/MessageSenderLib.sol";
import "sgn-v2-contracts/contracts/message/libraries/MsgDataTypes.sol";
import "sgn-v2-contracts/contracts/message/interfaces/IMessageReceiverApp.sol";

import "../interfaces/IUniswapV2Router02.sol";

import "./Execs.sol";

contract FantomTestnetCelerBridge is Execs {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct ExecsRequest {
        address originalAddress;
        address[] tos;
        bytes[] datas;
    }

    enum TransferStatus {
        Null,
        Success,
        Fail
    }

    struct TransferReceipt {
        uint64 nonce;
        TransferStatus status;
    }

    uint64 nonce;
    address messageBus;

    event SuccessfulExecuteMessage(uint64 src_chainID, address sender);
    event ExecutedMessageWithTransfer(
        address _sender,
        address _token,
        uint256 _amount,
        uint64 _srcChainId,
        bytes _message,
        address _executor
    );

    // Ensure that only the designated accounts (message bus) can call execute
    modifier onlyMessageBus() {
        require(msg.sender == messageBus, "Caller is not message bus");
        _;
    }

    constructor(address _messageBus) {
        messageBus = _messageBus;
    }

    function executeMessageWithTransfer(
        address _sender,
        address _token,
        uint256 _amount,
        uint64 _srcChainId,
        bytes memory _message,
        address _executor
    )
        external
        payable
        onlyMessageBus
        returns (IMessageReceiverApp.ExecutionStatus)
    {
        // Decode the message
        ExecsRequest memory execsRequest = abi.decode(
            (_message),
            (ExecsRequest)
        );
        address originalAddress = execsRequest.originalAddress;
        address[] memory tos = execsRequest.tos;
        bytes[] memory datas = execsRequest.datas;

        // loop over contract addresses and execute the desired function call
        _execs(tos, datas);

        // Indicate successful handling of message
        return IMessageReceiverApp.ExecutionStatus.Success;
    }

    function approveTokens(
        address _spender,
        uint256 _amount,
        address _token
    ) external {
        IERC20 token_to_approve = IERC20(_token);
        token_to_approve.approve(_spender, _amount);
    }
}
