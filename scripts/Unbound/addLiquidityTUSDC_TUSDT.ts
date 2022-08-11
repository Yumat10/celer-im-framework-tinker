import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, IUniswapV2Router02 } from "../../typechain-types"

const TUSDC_ADDRESS = "0x0C520Bc3E90D28212bc5c9904B73425c2c58c8E5"
const TUSDC_AMOUNT = "50000"

const TUSDT_ADDRESS = "0x5834f0964Fcab742C6E7a1888b93f6F76DBB47f5"
const TUSDT_AMOUNT = "50000"

const UNBOUND_ROUTER_CONTRACT = "0x65278880bDBBB1E020f2b871Da89b1dDD6639D08"

async function main() {
    console.log("---Add liquidity to TUSDC-TUSDT pool in Unbound Finance---")
    const { deployer } = await getNamedAccounts()

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
    const unbound: IUniswapV2Router02 = await ethers.getContractAt(
        "IUniswapV2Router02",
        UNBOUND_ROUTER_CONTRACT,
        deployer
    )

    console.log("Adding liquidity to TUSDC-TUSDC pool...")
    const txResponse = await unbound.addLiquidity(
        TUSDC_ADDRESS,
        TUSDT_ADDRESS,
        TUSDC_AMOUNT,
        TUSDT_AMOUNT,
        1,
        1,
        "0x96564B0744A524B792B4dD61340C9D44ed74ff52",
        1760066100,
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
