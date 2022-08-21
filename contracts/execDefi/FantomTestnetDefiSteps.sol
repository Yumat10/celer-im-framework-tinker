// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "sgn-v2-contracts/contracts/message/libraries/MessageSenderLib.sol";
import "sgn-v2-contracts/contracts/message/libraries/MsgDataTypes.sol";
import "sgn-v2-contracts/contracts/message/interfaces/IMessageReceiverApp.sol";

import "../interfaces/IUniswapV2Router02.sol";

contract FantomTestnetDefiSteps {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

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

    struct SpookySwapParams {
        uint256 amountIn;
        uint256 amountOutMin;
        address[] path;
        address to;
        uint256 deadline;
    }

    // Spooky Swap addresses
    address constant SPOOKY_SWAP_CONTRACT =
        0xa6AD18C2aC47803E193F75c3677b14BF19B94883;

    address constant USDT_ADDRESS = 0x7d43AABC515C356145049227CeE54B608342c0ad;

    // Unbound Finance addresses
    address constant UNBOUND_ROUTER_CONTRACT =
        0x65278880bDBBB1E020f2b871Da89b1dDD6639D08;

    address constant TUSDT_ADDRESS = 0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5;

    address constant TUSDC_ADDRESS = 0x0C520Bc3E90D28212bc5c9904B73425c2c58c8E5;

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

    // Swap USDT for TUSDC and TUSDT on Spooky Swap
    function _swapUSDT(uint256 total_amount)
        internal
        returns (uint256 TUSDT_AMOUNT, uint256 TUSDC_AMOUNT)
    {
        // Approve Spooky Swap to perform USDT transfer (swap for TUSDT and TUSDC)
        IERC20(USDT_ADDRESS).approve(SPOOKY_SWAP_CONTRACT, total_amount);
        uint256 amount_to_swap = total_amount.div(2);

        // Get Spooky Swap contract
        IUniswapV2Router02 SpookySwap = IUniswapV2Router02(
            SPOOKY_SWAP_CONTRACT
        );

        // Swap USDT for TUSDT
        address[] memory USDT_TUSDT_path = new address[](2);
        USDT_TUSDT_path[0] = USDT_ADDRESS;
        USDT_TUSDT_path[1] = TUSDT_ADDRESS;
        uint256 deadline = block.timestamp + 300;
        uint256[] memory TUSDT_amounts = SpookySwap.swapExactTokensForTokens(
            amount_to_swap,
            0,
            USDT_TUSDT_path,
            address(this),
            deadline
        );
        // Get the amount of TUSDC received
        TUSDT_AMOUNT = TUSDT_amounts[TUSDT_amounts.length - 1];

        // Swap USDT for TUSDC
        address[] memory USDT_TUSDC_path = new address[](2);
        USDT_TUSDC_path[0] = USDT_ADDRESS;
        USDT_TUSDC_path[1] = TUSDC_ADDRESS;
        uint256[] memory TUSDC_amounts = SpookySwap.swapExactTokensForTokens(
            amount_to_swap,
            0,
            USDT_TUSDC_path,
            address(this),
            deadline
        );
        // Get the amount of TUSDC received
        TUSDC_AMOUNT = TUSDC_amounts[TUSDC_amounts.length - 1];
    }

    // Provide liquidity in TUSDT-TUSDC pool in Unbound Finance
    function _provideLiquidityTUSDT_TUSDC(
        uint256 TUSDT_AMOUNT,
        uint256 TUSDC_AMOUNT,
        address lp_token_destination
    ) internal {
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
            lp_token_destination, // Send LP token to the destination address
            block.timestamp + 300
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
        address src_chain_caller_address = transfer.accounts[0];
        uint256 total_amount = transfer.amounts[0];

        // Spooky Swap
        (uint256 TUSDT_AMOUNT, uint256 TUSDC_AMOUNT) = _swapUSDT(total_amount);

        // Unbound Finance
        _provideLiquidityTUSDT_TUSDC(
            TUSDT_AMOUNT,
            TUSDC_AMOUNT,
            src_chain_caller_address // Send LP token to the original caller on the src chain
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
