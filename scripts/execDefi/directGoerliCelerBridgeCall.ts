// Test to see if the Celer bridge contract is working

import { ethers, getNamedAccounts } from "hardhat"
import { GoerliCelerBridge, IERC20 } from "../../typechain-types"

const SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS =
    "0x81966FaC48E76910594Db12878d5d43eD6b37598"

const GOERLI_BRIDGE_CONTRACT_ADDRESS =
    "0x75d00Ba4fa6eeE43B1909D6e1833651Aa2A50761"
const FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS =
    "0x006E80ac87AE498Fd0508BAD291ABA80fC7F3fda"

const USDT_TOKEN_ADDRESS = "0xf4B2cbc3bA04c478F0dC824f4806aC39982Dce73"
const USDT_TOKEN_AMOUNT = "5500000"

const SPOOKYSWAP_CONTACT_ADDRESS = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"
const TUSDT_TOKEN_ADDRESS = "0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5"
const TUSDC_TOKEN_ADDRESS = "0x0C520Bc3E90D28212bc5c9904B73425c2c58c8E5"

const UNBOUND_ROUTER_CONTRACT_ADDRESS =
    "0x65278880bDBBB1E020f2b871Da89b1dDD6639D08"

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
