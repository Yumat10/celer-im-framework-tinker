import { ethers, getNamedAccounts } from "hardhat"
import {
    IERC20,
    IUniswapV2Router02,
    SimpleUnboundLiquidity,
} from "../typechain-types"

/**
 * Notes:
 *
 * The executor must be running
 * The executer address needs native tokens in the destination chain to carry out the "executeMessageWithTransfer"
 * The Goerli SimpleUnboundLiquidity contract must be approved for CELR transfer on behalf of caller/deployer
 * Some fees must be paid to the SGN when routing messages
 */

const GOERLI_CONTRACT = "0x2B9ADF5460e12b1657090EEDbaEfF10C09aA4BEf"
const FTM_TESTNET_CONTRACT = "0xD6CFCf376f73c402188737A9466fc500E096B5F4"

const USDT_ADDRESS = "0xf4B2cbc3bA04c478F0dC824f4806aC39982Dce73"
const USDT_AMOUNT = "10000000"

async function main() {
    console.log("---SimpleUnboundLiquidity---")
    const { deployer } = await getNamedAccounts()

    const USDTContract: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_ADDRESS,
        deployer
    )

    // Approve USDT transfer
    console.log("USDT approval...")
    const approvalTx = await USDTContract.approve(GOERLI_CONTRACT, USDT_AMOUNT)
    console.log("Sent USDT approval...")
    await approvalTx.wait(1)
    console.log("Approved USDT token transfer on behalf of user")

    // Simple Unbound Liquidity
    const SimpleUnboundLiquidity: SimpleUnboundLiquidity =
        await ethers.getContract("SimpleUnboundLiquidity", deployer)
    console.log(
        "SimpleUnboundLiquidity Contract: ",
        SimpleUnboundLiquidity.address
    )
    console.log("Starting batch transfer...")
    const txResponse = await SimpleUnboundLiquidity.simpleUnboundLiquidity(
        FTM_TESTNET_CONTRACT,
        USDT_ADDRESS,
        USDT_AMOUNT, // Send 20 USDC Tokens
        4002, // FTM Testnet
        1000000, // 100% Slippage since testnet pools tend to be imbalanced
        1, // Pool-based liquidity bridge
        ["0x96564B0744A524B792B4dD61340C9D44ed74ff52"],
        ["9000000"],
        {
            gasLimit: 300000,
            value: ethers.utils.parseEther("0.001"), // Fee to pay SGN for routing fees
        }
    )

    console.log(
        "Sent simple Unbound liquidity, waiting for confirmations...",
        txResponse.hash
    )

    const txReceipt = await txResponse.wait(3)

    console.log("Finished Unbound liquidity! ", txReceipt.transactionHash)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
