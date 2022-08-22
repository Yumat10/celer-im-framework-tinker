// Test to see if the Celer bridge contract is working

import { ethers, getNamedAccounts } from "hardhat"
import { GoerliCelerBridge, IERC20 } from "../../typechain-types"
import { FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS, GOERLI_BRIDGE_CONTRACT_ADDRESS, GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS, USDT_TOKEN_ADDRESS, USDT_TOKEN_AMOUNT } from "./execDefiConstants"

async function main() {
    const { deployer } = await getNamedAccounts()

    // // Approve USDT transfer
    const USDTContract: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_TOKEN_ADDRESS,
        deployer
    )

    console.log("USDT approval...")
    const approvalTx = await USDTContract.approve(
        GOERLI_BRIDGE_CONTRACT_ADDRESS,
        USDT_TOKEN_AMOUNT
    )
    console.log("Sent USDT approval...")
    await approvalTx.wait(2)
    console.log("Approved USDT token transfer on behalf of user")

    const goerliCelerBridge: GoerliCelerBridge = await ethers.getContractAt(
        "GoerliCelerBridge",
        GOERLI_BRIDGE_CONTRACT_ADDRESS,
        deployer
    )

    console.log("Calling bridging")

    const bridgingResponse =
        await goerliCelerBridge.goerliToFantomTestnetBridge(
            FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
            USDT_TOKEN_ADDRESS,
            USDT_TOKEN_AMOUNT,
            GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
            deployer,
            [],
            [],
            {
                gasLimit: 210000,
                gasPrice: 2000000,
                value: ethers.utils.parseEther("0.001"), // Fee to pay SGN for routing fees
            }
        )

    console.log("Sent bridge tx: ", bridgingResponse.hash)

    await bridgingResponse.wait(3)

    console.log("Success!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
