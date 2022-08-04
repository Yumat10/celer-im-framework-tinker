import { ethers, getNamedAccounts } from "hardhat"
import { SimpleBatchTransfer } from "../typechain-types"

/**
 * Notes:
 *
 * The executor must be running
 * The executer address needs native tokens in the destination chain to carry out the "executeMessageWithTransfer"
 * The Goerli SimpleBatchTransfer contract must be approved for CELR transfer on behalf of caller/deployer
 */

const BSC_TESTNET_CONTRACT = "0x2ae892d2988c070eecb50cd86b8cf14824f47456"
const CELER_TOKEN = "0x5d3c0f4ca5ee99f8e8f59ff9a5fab04f6a7e007f"

async function main() {
    console.log("---batchTransfer---")
    const { deployer } = await getNamedAccounts()

    const SimpleBatchTransfer: SimpleBatchTransfer = await ethers.getContract(
        "SimpleBatchTransfer",
        deployer
    )

    console.log("SimpleBatchTransfer Contract: ", SimpleBatchTransfer.address)

    console.log("Starting batch transfer...")
    const txResponse = await SimpleBatchTransfer.batchTransfer(
        BSC_TESTNET_CONTRACT,
        CELER_TOKEN,
        "100000000000000000000", // Send 100 Celer Tokens
        97, // BSC Testnet
        1000000, // 100% Slippage since testnet pools tend to be imbalanced
        1, // Pool-based liquidity bridge
        [
            "0x96564B0744A524B792B4dD61340C9D44ed74ff52",
            "0x7AdA804cE98bB796139dfc7770075E867b88E8DC",
        ],
        ["40000000000000000000", "40000000000000000000"], // Split 40-40 since bridge fees exist
        {
            gasLimit: 300000,
            value: ethers.utils.parseEther("0.005"),
        }
    )
    console.log("Sent batch transfer, waiting for confirmations...")

    await txResponse.wait(1)

    console.log("Finished batched transfer!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
