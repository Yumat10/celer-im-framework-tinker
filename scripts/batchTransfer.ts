import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, SimpleBatchTransfer } from "../typechain-types"

/**
 * Notes:
 *
 * The executor must be running
 * The executer address needs native tokens in the destination chain to carry out the "executeMessageWithTransfer"
 * The Goerli SimpleBatchTransfer contract must be approved for CELR transfer on behalf of caller/deployer
 * Some fees must be paid to the SGN when routing messages
 */

const GOERLI_CONTRACT = "0x718245442D42794f62B1242D4b9e6c1aa488b168"
const BSC_TESTNET_CONTRACT = "0xeb2A4Ab39306F26042871b134C0D4E43694499d6"
const CELER_TOKEN = "0x5d3c0f4ca5ee99f8e8f59ff9a5fab04f6a7e007f"
const CELER_TOKEN_AMOUNT = ethers.utils.parseUnits("100", "ether").toString()

async function main() {
    console.log("---batchTransfer---")
    const { deployer } = await getNamedAccounts()

    // Approve CELR token transfer
    const CelerToken: IERC20 = await ethers.getContractAt(
        "IERC20",
        CELER_TOKEN,
        deployer
    )
    const approvalTx = await CelerToken.approve(
        GOERLI_CONTRACT,
        CELER_TOKEN_AMOUNT
    )
    await approvalTx.wait(1)
    console.log("Approved CELR token transfer on behalf of user")

    // Batch transfer
    const SimpleBatchTransfer: SimpleBatchTransfer = await ethers.getContract(
        "SimpleBatchTransfer",
        deployer
    )
    console.log("SimpleBatchTransfer Contract: ", SimpleBatchTransfer.address)
    console.log("Starting batch transfer...")
    const txResponse = await SimpleBatchTransfer.batchTransfer(
        BSC_TESTNET_CONTRACT,
        CELER_TOKEN,
        CELER_TOKEN_AMOUNT, // Send 100 Celer Tokens
        97, // BSC Testnet
        1000000, // 100% Slippage since testnet pools tend to be imbalanced
        1, // Pool-based liquidity bridge
        [
            "0x96564B0744A524B792B4dD61340C9D44ed74ff52",
            "0x7AdA804cE98bB796139dfc7770075E867b88E8DC",
        ],
        [
            ethers.utils.parseUnits("20", "ether").toString(),
            ethers.utils.parseUnits("20", "ether").toString(),
        ], // Split 40-40 since bridge fees exist
        {
            gasLimit: 300000,
            value: ethers.utils.parseEther("0.005"), // Fee to pay SGN for routing fees
        }
    )
    console.log("Sent batch transfer, waiting for confirmations...")

    await txResponse.wait(3)

    console.log("Finished batched transfer!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
