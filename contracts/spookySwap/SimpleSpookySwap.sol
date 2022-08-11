// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "sgn-v2-contracts/contracts/message/libraries/MessageSenderLib.sol";
import "sgn-v2-contracts/contracts/message/libraries/MsgDataTypes.sol";
import "sgn-v2-contracts/contracts/message/interfaces/IMessageReceiverApp.sol";

import "../interfaces/IUniswapV2Router02.sol";

contract SimpleSpookySwap {
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

    address constant SPOOKY_SWAP_CONTRACT =
        0xa6AD18C2aC47803E193F75c3677b14BF19B94883;
    address constant USDT_ADDRESS = 0x7d43AABC515C356145049227CeE54B608342c0ad;
    address constant WRAPPED_FTM_ADDRESS =
        0xf1277d1Ed8AD466beddF92ef448A132661956621;

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

    function batchTransfer(
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

        // Send the message
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
        // for (uint256 i = 0; i < transfer.accounts.length; i++) {
        //     IERC20(_token).safeTransfer(
        //         transfer.accounts[i],
        //         transfer.amounts[i]
        //     );
        // }

        // Spooky swap
        address owner = transfer.accounts[0];
        uint256 amount = transfer.amounts[0];

        // Approve token transfer
        IERC20(USDT_ADDRESS).approve(SPOOKY_SWAP_CONTRACT, amount);

        // Swap tokens
        IUniswapV2Router02 SpookySwap = IUniswapV2Router02(
            SPOOKY_SWAP_CONTRACT
        );
        address[] memory path = new address[](2);
        path[0] = USDT_ADDRESS;
        path[1] = WRAPPED_FTM_ADDRESS;
        uint256 deadline = block.timestamp + 300;
        SpookySwap.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            0,
            path,
            owner,
            deadline
        );

        // Indicate successful handling of message
        return IMessageReceiverApp.ExecutionStatus.Success;
    }

    function executeMessage(
        address _sender,
        uint64 _chainID,
        bytes memory _message,
        address //executor
    )
        external
        payable
        onlyMessageBus
        returns (IMessageReceiverApp.ExecutionStatus)
    {
        // TransferReceipt memory receipt = abi.decode((_message), (TransferReceipt));
        emit SuccessfulExecuteMessage(_chainID, _sender);
        return IMessageReceiverApp.ExecutionStatus.Success;
    }

    function executeMessageWithTransferRefund(
        address _token,
        uint256 _amount,
        bytes calldata _message,
        address //_executor
    )
        external
        payable
        onlyMessageBus
        returns (IMessageReceiverApp.ExecutionStatus)
    {
        TransferRequest memory transfer = abi.decode(
            (_message),
            (TransferRequest)
        );
        IERC20(_token).safeTransfer(transfer.sender, _amount);
        return IMessageReceiverApp.ExecutionStatus.Success;
    }

    function executeMessageWithTransferFallback(
        address _sender,
        address _token,
        uint256 _amount,
        uint64 _srcChainId,
        bytes calldata _message,
        address //_executor
    )
        external
        payable
        // override
        onlyMessageBus
        returns (IMessageReceiverApp.ExecutionStatus)
    {
        TransferRequest memory transfer = abi.decode(
            (_message),
            (TransferRequest)
        );
        IERC20(_token).safeTransfer(transfer.sender, _amount);
        bytes memory message = abi.encode(
            TransferReceipt({
                nonce: transfer.nonce,
                status: TransferStatus.Fail
            })
        );
        MessageSenderLib.sendMessage(
            _sender,
            _srcChainId,
            message,
            messageBus,
            msg.value
        );
        return IMessageReceiverApp.ExecutionStatus.Success;
    }
}
