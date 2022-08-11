import { ethers, getNamedAccounts } from "hardhat"
import {
    IERC20,
    IUniswapV2Router02,
    SimpleSpookySwap,
} from "../typechain-types"

/**
 * Notes:
 *
 * The executor must be running
 * The executer address needs native tokens in the destination chain to carry out the "executeMessageWithTransfer"
 * The Goerli SimpleSpookySwap contract must be approved for CELR transfer on behalf of caller/deployer
 * Some fees must be paid to the SGN when routing messages
 */

const GOERLI_CONTRACT = "0x8dF1577f06829ba7882240e670557Ab57d26B126"
const FTM_TESTNET_CONTRACT = "0xF5B82F070e248233381EC34482F280756711d8e4"

const WETH_ADDRESS = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
const WETH_AMOUNT = ethers.utils.parseEther("0.00001")

const USDT_ADDRESS = "0xf4B2cbc3bA04c478F0dC824f4806aC39982Dce73"
const USDT_AMOUNT = "10000000"

// async function main() {
//     console.log("---SimpleSpookySwap---")
//     const { deployer } = await getNamedAccounts()

//     const WETHContract: IERC20 = await ethers.getContractAt(
//         "IERC20",
//         WETH_ADDRESS,
//         deployer
//     )

//     // Approve WETH transfer
//     console.log("WETH approval...")
//     const approvalTx = await WETHContract.approve(GOERLI_CONTRACT, WETH_AMOUNT)
//     console.log("Sent WETH approval...")
//     await approvalTx.wait(1)
//     console.log("Approved WETH token transfer on behalf of user")

//     // Simple spooky swap
//     const SimpleSpookySwap: SimpleSpookySwap = await ethers.getContract(
//         "SimpleSpookySwap",
//         deployer
//     )
//     console.log("SimpleSpookySwap Contract: ", SimpleSpookySwap.address)
//     console.log("Starting batch transfer...")
//     const txResponse = await SimpleSpookySwap.batchTransfer(
//         FTM_TESTNET_CONTRACT,
//         WETH_ADDRESS,
//         WETH_AMOUNT, // Send 20 USDC Tokens
//         4002, // FTM Testnet
//         1000000, // 100% Slippage since testnet pools tend to be imbalanced
//         1, // Pool-based liquidity bridge
//         ["0x96564B0744A524B792B4dD61340C9D44ed74ff52"],
//         [ethers.utils.parseEther("0.0000090").toString()],
//         {
//             gasLimit: 300000,
//             value: ethers.utils.parseEther("0.001"), // Fee to pay SGN for routing fees
//         }
//     )
//     console.log("Sent simple spooky swap, waiting for confirmations...")

//     await txResponse.wait(3)

//     console.log("Finished spooky swap!")
// }

async function main() {
    console.log("---SimpleSpookySwap---")
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

    // Simple spooky swap
    const SimpleSpookySwap: SimpleSpookySwap = await ethers.getContract(
        "SimpleSpookySwap",
        deployer
    )
    console.log("SimpleSpookySwap Contract: ", SimpleSpookySwap.address)
    console.log("Starting batch transfer...")
    const txResponse = await SimpleSpookySwap.batchTransfer(
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
    console.log("Sent simple spooky swap, waiting for confirmations...")

    const txReceipt = await txResponse.wait(3)

    console.log("Finished spooky swap! ", txReceipt.transactionHash)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
