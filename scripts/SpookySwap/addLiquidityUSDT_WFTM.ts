import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, IUniswapV2Router02 } from "../../typechain-types"

const WFTM_ADDRESS = "0xf1277d1Ed8AD466beddF92ef448A132661956621"
const WFTM_AMOUNT = "385032617"

const USDT_ADDRESS = "0x7d43AABC515C356145049227CeE54B608342c0ad"
const USDT_AMOUNT = "200000000"

const SPOOKY_SWAP_CONTRACT = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"

export async function addLiquidityUSDT_WFTM() {
    console.log("---Add liquidity to USDT-WFTM pool in Spooky Swap---")
    const { deployer } = await getNamedAccounts()

    // Approve Spooky Swap to use our WFTM and USDT
    const WFTM: IERC20 = await ethers.getContractAt(
        "IERC20",
        WFTM_ADDRESS,
        deployer
    )
    console.log("Approving WFTM...")
    const WFTMApprovalTx = await WFTM.approve(SPOOKY_SWAP_CONTRACT, WFTM_AMOUNT)
    await WFTMApprovalTx.wait(1)
    console.log("WFTM approved!")

    const USDT: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_ADDRESS,
        deployer
    )
    console.log("Approving USDT...")
    const USDTApprovalTx = await USDT.approve(SPOOKY_SWAP_CONTRACT, USDT_AMOUNT)
    await USDTApprovalTx.wait(1)
    console.log("USDT approved!")

    // Add liquidity to USDT - WFTM pool in Spooky Swap
    const spookySwap: IUniswapV2Router02 = await ethers.getContractAt(
        "IUniswapV2Router02",
        SPOOKY_SWAP_CONTRACT,
        deployer
    )

    console.log("Adding liquidity to USDT-WFTM pool...")
    const txResponse = await spookySwap.addLiquidity(
        WFTM_ADDRESS,
        USDT_ADDRESS,
        WFTM_AMOUNT,
        USDT_AMOUNT,
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

    console.log("Added liquidity to USDT-WFTM pool!")
}
