import { ethers, getNamedAccounts } from "hardhat"
import { IERC20 } from "../typechain-types"

const WFTM_ADDRESS = "0xf1277d1ed8ad466beddf92ef448a132661956621"
const USDT_ADDRESS = "0x7d43aabc515c356145049227cee54b608342c0ad"
const SPOOKY_SWAP_CONTRACT = "0xa6ad18c2ac47803e193f75c3677b14bf19b94883"

async function main() {
    console.log("---approveTokens---")
    const { deployer } = await getNamedAccounts()

    console.log("Getting contracts...")
    const WFTMContract: IERC20 = await ethers.getContractAt(
        "IERC20",
        WFTM_ADDRESS,
        deployer
    )
    // const USDTContract: IERC20 = await ethers.getContractAt(
    //     "IERC20",
    //     USDT_ADDRESS,
    //     deployer
    // )

    console.log("Approving tokens...")

    const WFTMTx = await WFTMContract.approve(
        SPOOKY_SWAP_CONTRACT,
        "11000000000000000000"
    )
    await WFTMTx.wait(1)

    console.log("Approved WFTM")

    // const USDTTx = await USDTContract.approve(
    //     SPOOKY_SWAP_CONTRACT,
    //     "5713801630589665212"
    // )
    // await USDTTx.wait(1)

    // console.log("Approved USDT")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
