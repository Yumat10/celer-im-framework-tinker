import { ethers, getNamedAccounts } from "hardhat"
import {
    IERC20,
    IUniswapV2Router02,
    SimpleSpookyUnbound,
} from "../typechain-types"

/**
 * Notes:
 *
 * The executor must be running
 * The executer address needs native tokens in the destination chain to carry out the "executeMessageWithTransfer"
 * The Goerli SimpleSpookyUnbound contract must be approved for CELR transfer on behalf of caller/deployer
 * Some fees must be paid to the SGN when routing messages
 */

const GOERLI_CONTRACT = "0x99E59649f7a49781604E3b35E9dFC509181CB13C"
const FTM_TESTNET_CONTRACT = "0x1b27484F478B01c9771267792D4e2C4247EcF34B"

const USDT_ADDRESS = "0xf4B2cbc3bA04c478F0dC824f4806aC39982Dce73"
const USDT_AMOUNT = "10000000"

async function main() {
    console.log("---SimpleSpookyUnbound---")
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

    // Simple spooky unbound
    const SimpleSpookyUnbound: SimpleSpookyUnbound = await ethers.getContract(
        "SimpleSpookyUnbound",
        deployer
    )
    console.log("SimpleSpookyUnbound Contract: ", SimpleSpookyUnbound.address)
    console.log("Starting spooky unbound...")
    const txResponse = await SimpleSpookyUnbound.spookyUnbound(
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
        "Sent simple spooky unbound, waiting for confirmations...",
        txResponse.hash
    )

    const txReceipt = await txResponse.wait(3)

    console.log("Finished spooky unbound! ", txReceipt.transactionHash)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
