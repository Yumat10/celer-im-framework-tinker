// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "../../interfaces/IERC20.sol";

contract SimpleCelrTransferFrom {
    address constant CELER_TOKEN_ADDRESS =
        0x5D3c0F4cA5EE99f8E8F59Ff9A5fAb04F6a7e007f;

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public {
        IERC20 CELR = IERC20(CELER_TOKEN_ADDRESS);
        CELR.transferFrom(from, to, amount);
    }
}
