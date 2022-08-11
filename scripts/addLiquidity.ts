import { ethers, getNamedAccounts } from "hardhat"
import { IUniswapV2Factory, IUniswapV2Router02 } from "../typechain-types"

const WFTM_ADDRESS = "0xf1277d1Ed8AD466beddF92ef448A132661956621"
const WFTM_AMOUNT = "385032617"

const USDT_ADDRESS = "0x7d43AABC515C356145049227CeE54B608342c0ad"
const USDT_AMOUNT = "200000000"

const SPOOKY_SWAP_FACTORY = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"
const SPOOKY_SWAP_CONTRACT = "0xa6AD18C2aC47803E193F75c3677b14BF19B94883"

async function main() {
    console.log("---addLiquidity---")
    const { deployer } = await getNamedAccounts()

    const spookySwapFactory: IUniswapV2Factory = await ethers.getContractAt(
        "IUniswapV2Factory",
        SPOOKY_SWAP_FACTORY,
        deployer
    )

    const spookySwap: IUniswapV2Router02 = await ethers.getContractAt(
        "IUniswapV2Router02",
        SPOOKY_SWAP_CONTRACT,
        deployer
    )

    console.log("Adding liquidity...")

    await spookySwap.addLiquidity(
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

    console.log("Added liquidity")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
