import { ethers, getNamedAccounts, network } from "hardhat"
import { IERC20, IUniswapV2Router02 } from "../../typechain-types"

const TUSDC_ADDRESS = "0x0C520Bc3E90D28212bc5c9904B73425c2c58c8E5"

const TUSDT_ADDRESS = "0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5"

const UNBOUND_ROUTER_CONTRACT = "0x65278880bDBBB1E020f2b871Da89b1dDD6639D08"

export async function main() {
    console.log("---Add liquidity to TUSDC-TUSDT pool in Unbound Finance---")

    if (network.name !== "ftmTestnet") {
        console.log(
            "Must be on Fantom Testnet to add liquidity to Unbound Finance"
        )
        return
    }

    const { deployer } = await getNamedAccounts()

    // Get the Unbound router contract
    const unbound: IUniswapV2Router02 = await ethers.getContractAt(
        "IUniswapV2Router02",
        UNBOUND_ROUTER_CONTRACT,
        deployer
    )

    // Calculate amount of TUSDC and TUSDC to stake to maintain 1-1 liquidity ratio
    console.log("Getting quote for providing TUSDC-TUSDT liquidity")
    const TUSDC_AMOUNT = "50000"
    const TUSDTRequired = await unbound.quote(
        TUSDC_AMOUNT,
        TUSDC_ADDRESS,
        TUSDT_ADDRESS
    )
    const TUSDT_AMOUNT = TUSDTRequired.toString()
    console.log(
        `Must provide ${TUSDC_AMOUNT} of TUSDC and ${TUSDT_AMOUNT} of TUSDT`
    )

    // Approve Unbound to use our TUSDC and TUSDT
    const TUSDC: IERC20 = await ethers.getContractAt(
        "IERC20",
        TUSDC_ADDRESS,
        deployer
    )
    console.log("Approving TUSDC...")
    const TUSDCApprovalTx = await TUSDC.approve(
        UNBOUND_ROUTER_CONTRACT,
        TUSDC_AMOUNT
    )
    await TUSDCApprovalTx.wait(1)
    console.log("TUSDC approved!")

    const TUSDT: IERC20 = await ethers.getContractAt(
        "IERC20",
        TUSDT_ADDRESS,
        deployer
    )
    console.log("Approving TUSDT...")
    const TUSDTApprovalTx = await TUSDT.approve(
        UNBOUND_ROUTER_CONTRACT,
        TUSDT_AMOUNT
    )
    await TUSDTApprovalTx.wait(1)
    console.log("TUSDT approved!")

    // Add liquidity to TUSDT - TUSDC pool in Unbound
    console.log("Adding liquidity to TUSDC-TUSDC pool...")
    const txResponse = await unbound.addLiquidity(
        TUSDC_ADDRESS,
        TUSDT_ADDRESS,
        TUSDC_AMOUNT,
        TUSDT_AMOUNT,
        1,
        1,
        deployer,
        Math.floor(Date.now() / 1000) + 10 * 60, // 10min into the future
        {
            gasLimit: 2100000,
            gasPrice: 2000000000,
        }
    )
    console.log("Sent liquidity tx...")
    await txResponse.wait(1)

    console.log("Added liquidity to TUSDT-TUSDC pool!")
}

export { main as addLiquidityTSUSDC_TUSDT }

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
