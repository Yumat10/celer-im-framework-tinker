import { ethers, getNamedAccounts, network } from "hardhat"
import { IERC20, IUniswapV2Router02 } from "../../typechain-types"

const TUSDT_ADDRESS = "0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5"

const USDT_ADDRESS = "0x7d43AABC515C356145049227CeE54B608342c0ad"

const SPOOKY_SWAP_CONTRACT = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"

// Provide liquidity to USDT-TUSDT pool in Spooky Swap
export async function main() {
    console.log("---Add liquidity to USDT-TUSDT pool in Spooky Swap---")

    if (network.name !== "ftmTestnet") {
        console.log(
            "Must be on Fantom Testnet to add liquidity to Unbound Finance"
        )
        return
    }

    const { deployer } = await getNamedAccounts()

    // Get the Spooky Swap router contract
    const spookySwap: IUniswapV2Router02 = await ethers.getContractAt(
        "IUniswapV2Router02",
        SPOOKY_SWAP_CONTRACT,
        deployer
    )

    // Calculate amount of USDC and TUSDT to stake to maintain 1-1 liquidity ratio
    console.log("Getting quote for providing USDT-TUSDT liquidity")
    const USDT_AMOUNT = "500000"
    const TUSDTRequired = await spookySwap.quote(
        USDT_AMOUNT,
        USDT_ADDRESS,
        TUSDT_ADDRESS
    )
    const TUSDT_AMOUNT = TUSDTRequired.toString()
    console.log(
        `Must provide ${USDT_AMOUNT} of USDT and ${TUSDT_AMOUNT} of TUSDT`
    )

    // Approve Spooky Swap to use our TUSDT and USDT
    const TUSDT: IERC20 = await ethers.getContractAt(
        "IERC20",
        TUSDT_ADDRESS,
        deployer
    )
    console.log("Approving TUSDT...")
    const TUSDTApprovalTx = await TUSDT.approve(
        SPOOKY_SWAP_CONTRACT,
        TUSDT_AMOUNT
    )
    await TUSDTApprovalTx.wait(1)
    console.log("TUSDT approved!")

    const USDT: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_ADDRESS,
        deployer
    )
    console.log("Approving USDT...")
    const USDTApprovalTx = await USDT.approve(SPOOKY_SWAP_CONTRACT, USDT_AMOUNT)
    await USDTApprovalTx.wait(1)
    console.log("USDT approved!")

    // Add liquidity to USDT - TUSDT pool in Spooky Swap
    console.log("Adding liquidity to USDT-TUSDT pool...")
    const txResponse = await spookySwap.addLiquidity(
        TUSDT_ADDRESS,
        USDT_ADDRESS,
        TUSDT_AMOUNT,
        USDT_AMOUNT,
        1,
        1,
        deployer,
        Math.floor(Date.now() / 1000) + 10 * 60, // 10min into the future
        {
            gasLimit: 2100000,
            gasPrice: 2000000000,
        }
    )
    console.log("Sent liquidity tx...", txResponse.hash)
    await txResponse.wait(1)

    console.log("Added liquidity to USDT-TUSDT pool!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
