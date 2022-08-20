import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, SimplifiedLoopedExec } from "../../typechain-types"

const SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS =
    "0x81966FaC48E76910594Db12878d5d43eD6b37598"
const SIMPLE_CELR_TRANSFER_FROM_CONTRACT_ADDRESS =
    "0xc950a9857fdda950abEFC025EA006A7bdF3A67f5"

async function main() {
    const { deployer } = await getNamedAccounts()

    // Get SimplifiedLoopedExec contract
    const SimplifiedLoopedExec: SimplifiedLoopedExec =
        await ethers.getContractAt(
            "SimplifiedLoopedExec",
            SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
            deployer
        )

    // Get the CELR token contract
    const CELR_TOKEN_ADDRESS = "0x5D3c0F4cA5EE99f8E8F59Ff9A5fAb04F6a7e007f"
    const CelrToken: IERC20 = await ethers.getContractAt(
        "IERC20",
        CELR_TOKEN_ADDRESS,
        deployer
    )

    // Approve Celer for transfer
    console.log("Approving CELR for transfer...")
    const approvalResponse = await CelrToken.approve(
        SIMPLE_CELR_TRANSFER_FROM_CONTRACT_ADDRESS,
        ethers.utils.parseUnits("20", "ether")
    )
    console.log("Sent approval tx...")
    await approvalResponse.wait(3)
    console.log("Approved CELR for transfer")

    console.log("Encoding transfer function call...")
    const tos = [SIMPLE_CELR_TRANSFER_FROM_CONTRACT_ADDRESS]

    const ABI = [
        "function transferFrom(address from, address to, uint256 amount)",
    ]
    const iface = new ethers.utils.Interface(ABI)
    const approveFuncEncoded = iface.encodeFunctionData("transferFrom", [
        deployer,
        "0x7AdA804cE98bB796139dfc7770075E867b88E8DC",
        ethers.utils.parseUnits("10", "ether"),
    ])

    const datas = [approveFuncEncoded]

    console.log("Encoded function call data")

    console.log("Calling initiate...")
    const simplifiedLoopedExecInitiateResponse =
        await SimplifiedLoopedExec.initiate(tos, datas, {
            gasLimit: 210000,
            gasPrice: 2000000,
        })

    console.log(
        "Sent looped exec, waiting for confirmations...",
        simplifiedLoopedExecInitiateResponse.hash
    )

    await simplifiedLoopedExecInitiateResponse.wait(3)

    console.log("Success!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
