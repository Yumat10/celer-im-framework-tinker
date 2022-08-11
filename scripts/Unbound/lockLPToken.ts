import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, IKyberNetwork, IUniswapV2Pair } from "../../typechain-types"

const TUSDT_TUSDC_LP_TOKEN_ADDRESS =
    "0xd1a3961aE10744DbA5001984cf26c6E435Ff8CfE"
const TUSDT_TUSDC_LP_TOKEN_AMOUNT = "50000"

const UND_TOKEN_ADDRESS = "0xC9c3674AB0Dd9a94C10a9a26A2fe43e05948Ffa4"

const TUSDC_TUSDT_VAULT_ADDRESS = "0x265AEF37EB252Bfe545786Ff4199E92B49085042"

async function main() {
    console.log("---lock Unbound TUSDT-TUSDC LP Tokens---")
    const { deployer } = await getNamedAccounts()

    // Approve vault to use LP Token
    console.log("Approving LP Token usage...")
    const TUSDT_TUSDC_LP_TOKEN: IERC20 = await ethers.getContractAt(
        "IERC20",
        TUSDT_TUSDC_LP_TOKEN_ADDRESS,
        deployer
    )
    const LPTokenApprovalTx = await TUSDT_TUSDC_LP_TOKEN.approve(
        TUSDC_TUSDT_VAULT_ADDRESS,
        TUSDT_TUSDC_LP_TOKEN_AMOUNT
    )
    console.log("Sent approval...")
    await LPTokenApprovalTx.wait(1)

    console.log("Approved LP Token usage!")

    // Mint UND by locking LP Tokens
    const TUSDC_TUSDT_VAULT: IUniswapV2Pair = await ethers.getContractAt(
        "IUniswapV2Pair",
        TUSDC_TUSDT_VAULT_ADDRESS,
        deployer
    )

    console.log("Swapping for UND...")
    const tradeTx = await TUSDC_TUSDT_VAULT.mint(deployer, {
        gasLimit: "3000000",
        gasPrice: "2000000000",
    })
    console.log("Sent UND swap tx...", tradeTx.hash)
    await tradeTx.wait(1)
    console.log("Successfully swapped!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
