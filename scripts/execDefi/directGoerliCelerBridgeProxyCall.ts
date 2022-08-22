// Test to see if the Celer bridge contract is working

import { BigNumber } from "ethers"
import { ethers, getNamedAccounts } from "hardhat"
import {  GoerliCelerBridgeProxy, IERC20 } from "../../typechain-types"
import{ FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS, GOERLI_BRIDGE_CONTRACT_ADDRESS, GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS, USDT_TOKEN_ADDRESS, USDT_TOKEN_AMOUNT } from "./execDefiConstants"

async function main() {
    const { deployer } = await getNamedAccounts()

    // // // Approve USDT transfer
    // const USDTContract: IERC20 = await ethers.getContractAt(
    //     "IERC20",
    //     USDT_TOKEN_ADDRESS,
    //     deployer
    // )

    // // console.log("USDT approval...")
    // const approvalTx = await USDTContract.approve(
    //     GOERLI_BRIDGE_CONTRACT_ADDRESS,
    //     USDT_TOKEN_AMOUNT
    // )
    // console.log("Sent USDT approval...", approvalTx.hash)
    // await approvalTx.wait(2)
    // console.log("Approved USDT token transfer on behalf of user")

    // // Send ETH to Goerli bridge proxy
    // console.log("Sending eth to Goerli bridge proxy...")
    // const deployerSigner = await ethers.getSigner(deployer)
    // const sendETHResponse = await deployerSigner.sendTransaction({
    //     to: GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS,
    //     value: ethers.utils.parseEther("0.001"),
    //     gasLimit: 300000,
    //     gasPrice: 2000000,
    // })
    // console.log("Sent tx: ", sendETHResponse.hash)
    // await sendETHResponse.wait(2)
    // console.log("Sent eth to Goerli bridge proxy")


    const goerliCelerBridgeProxy: GoerliCelerBridgeProxy = await ethers.getContractAt(
        "GoerliCelerBridgeProxy",
        GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS,
        deployer
    )

    console.log("Calling bridging")

    const bridgingResponse =
        await goerliCelerBridgeProxy.goerliToFantomTestnetBridgeProxy(
            FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
            USDT_TOKEN_ADDRESS,
            USDT_TOKEN_AMOUNT,
            deployer,
            [],
            [],
            ethers.utils.parseEther("0.001"), // Fee to pay SGN for routing fees
            {
                gasLimit: 210000,
                gasPrice: 2000000,
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
