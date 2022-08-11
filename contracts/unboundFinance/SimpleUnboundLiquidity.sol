// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "sgn-v2-contracts/contracts/message/libraries/MessageSenderLib.sol";
import "sgn-v2-contracts/contracts/message/libraries/MsgDataTypes.sol";
import "sgn-v2-contracts/contracts/message/interfaces/IMessageReceiverApp.sol";

import "../interfaces/IUniswapV2Router02.sol";

contract SimpleUnboundLiquidity {
    using SafeERC20 for IERC20;

    struct TransferRequest {
        uint64 nonce;
        address[] accounts;
        uint256[] amounts;
        address sender;
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

    address immutable OWNER_ADDRESS;

    address constant UNBOUND_ROUTER_CONTRACT =
        0x65278880bDBBB1E020f2b871Da89b1dDD6639D08;

    address constant TUSDT_ADDRESS = 0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5;
    uint256 constant TUSDT_AMOUNT = 50000;

    address constant TUSDC_ADDRESS = 0x0C520Bc3E90D28212bc5c9904B73425c2c58c8E5;
    uint256 constant TUSDC_AMOUNT = 50000;

    uint64 nonce;
    address messageBus;

    // Ensure that only the designated accounts (message bus) can call execute
    modifier onlyMessageBus() {
        require(msg.sender == messageBus, "Caller is not message bus");
        _;
    }

    constructor(address _messageBus) {
        messageBus = _messageBus;
        OWNER_ADDRESS = msg.sender;
    }

    function simpleUnboundLiquidity(
        address _receiver, // destination contract address
        address _token, // the input token
        uint256 _amount, // the input token amount
        uint64 _dstChainId, // destination chain id
        uint32 _maxSlippage, // the max amount of slippage allowed at bridge, represented in 1e6 as 100% (i.e. 1e4 = 1%)
        MsgDataTypes.BridgeSendType _bridgeType, // the bridge type, for this tutorial, we are using liquidity bridge
        address[] calldata _accounts, // the accounts on the destination chain that should receive the transfered fund
        uint256[] calldata _amounts // the amounts for each account
    ) external payable {
        // Each transfer is assigned a nonce
        nonce += 1;

        // Pull funds from the sender
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Encode message that specifies how funds are distributed on the destination chain
        bytes memory message = abi.encode(
            TransferRequest({
                nonce: nonce,
                accounts: _accounts,
                amounts: _amounts,
                sender: msg.sender
            })
        );

        // Send the message via Celer
        MessageSenderLib.sendMessageWithTransfer(
            _receiver,
            _token,
            _amount,
            _dstChainId,
            nonce,
            _maxSlippage,
            message,
            _bridgeType,
            messageBus,
            msg.value
        );
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
        TransferRequest memory transfer = abi.decode(
            (_message),
            (TransferRequest)
        );

        // Distribute the funds transfered
        for (uint256 i = 0; i < transfer.accounts.length; i++) {
            IERC20(_token).safeTransfer(
                transfer.accounts[i],
                transfer.amounts[i]
            );
        }

        // NOTE: Celer and Unbound use different versions of tokens in Fantom Testnet

        // Unbound Finance

        // Approve TUSDT and TUSDC tokens for transfer
        IERC20(TUSDT_ADDRESS).approve(UNBOUND_ROUTER_CONTRACT, TUSDT_AMOUNT);
        IERC20(TUSDC_ADDRESS).approve(UNBOUND_ROUTER_CONTRACT, TUSDC_AMOUNT);

        // Add liquidity to TUSDT-TUSDC pool on Unbound
        IUniswapV2Router02(UNBOUND_ROUTER_CONTRACT).addLiquidity(
            TUSDC_ADDRESS,
            TUSDT_ADDRESS,
            TUSDC_AMOUNT,
            TUSDT_AMOUNT,
            1,
            1,
            OWNER_ADDRESS, // Send LP token to the contract owner
            1760066100
        );

        // Indicate successful handling of message
        return IMessageReceiverApp.ExecutionStatus.Success;
    }
}
