// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GoerliDefiSteps {
    using SafeERC20 for IERC20;

    function approveTokens(
        address _spender,
        uint256 _amount,
        address _token
    ) external {
        IERC20 token_to_approve = IERC20(_token);
        token_to_approve.approve(_spender, _amount);
    }

    function safeTransferFrom(
        address _token,
        address _from,
        address _to,
        uint256 _value
    ) external {
        IERC20 token_to_transfer = IERC20(_token);
        token_to_transfer.safeTransferFrom(_from, _to, _value);
    }
}
