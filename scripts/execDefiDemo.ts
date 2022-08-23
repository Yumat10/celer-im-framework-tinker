import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, SimplifiedLoopedExec } from "../typechain-types"
import {
    USDT_TOKEN_ADDRESS,
    USDT_TOKEN_AMOUNT,
    GOERLI_BRIDGE_CONTRACT_ADDRESS,
    SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
    GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
    SPOOKY_UNBOUND_CONTRACT_ADDRESS,
} from "./execDefiConstants"

async function main() {
    // Get the Simplified Looped Exec Contract
    const { deployer } = await getNamedAccounts()

    console.log("Encoding functions to be called by Fantom Testnet execs()...")

    /**
     * Goerli Exec functions
     * Bridge Contract
     * */

    console.log("Encoding functions to be called by Goerli execs()...")

    // Encode "Bridge contract"
    const goerliBridgeABI = [
        "function goerliToFantomTestnetBridge(address _receiver, address _token, uint256 _amount, address _message_bus, address originalAddress, address[] calldata tos, bytes[] memory datas)",
    ]
    const goerliBridgeIface = new ethers.utils.Interface(goerliBridgeABI)
    const goerliBridgeFuncEncoded = goerliBridgeIface.encodeFunctionData(
        "goerliToFantomTestnetBridge",
        [
            SPOOKY_UNBOUND_CONTRACT_ADDRESS,
            USDT_TOKEN_ADDRESS,
            USDT_TOKEN_AMOUNT,
            GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
            deployer,
            [],
            [],
        ]
    )

    console.log("Encoded functions to be called by Goerli execs()!")

    // Approve USDT for transfer by Goerli bridge contract
    const USDTContract: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_TOKEN_ADDRESS,
        deployer
    )

    // Approve USDT transfer
    console.log("USDT approval...")
    const approvalExecsTx = await USDTContract.approve(
        SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
        USDT_TOKEN_AMOUNT
    )
    console.log("Sent USDT approval...", approvalExecsTx.hash)
    await approvalExecsTx.wait(2)
    console.log("Approved USDT token transfer on behalf of user")

    // console.log("USDT approval...")
    // const approvalBridgeTx = await USDTContract.approve(
    //     GOERLI_BRIDGE_CONTRACT_ADDRESS,
    //     USDT_TOKEN_AMOUNT
    // )
    // console.log("Sent USDT approval...", approvalBridgeTx.hash)
    // await approvalBridgeTx.wait(2)
    // console.log("Approved USDT token transfer on behalf of user")

    // // Send ETH to Goerli bridge
    // console.log("Sending eth to Goerli bridge ...")
    // const deployerSigner = await ethers.getSigner(deployer)
    // const sendETHResponse = await deployerSigner.sendTransaction({
    //     to: GOERLI_BRIDGE_CONTRACT_ADDRESS,
    //     value: ethers.utils.parseEther("0.002"),
    //     gasLimit: 300000,
    //     gasPrice: 2000000,
    // })
    // console.log("Sent tx: ", sendETHResponse.hash)
    // await sendETHResponse.wait(2)
    // console.log("Sent eth to Goerli bridge ")

    // Get SimplifiedLoopedExec contract
    const simplifiedLoopedExec: SimplifiedLoopedExec =
        await ethers.getContractAt(
            "SimplifiedLoopedExec",
            SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
            deployer
        )

    // Call initiate function to kick start execs process
    console.log("Initiate looped exec call on Goerli")
    const tos = [GOERLI_BRIDGE_CONTRACT_ADDRESS]
    const datas = [goerliBridgeFuncEncoded]

    const simplifiedLoopedExecInitiateResponse =
        await simplifiedLoopedExec.initiate(tos, datas, {
            value: ethers.utils.parseEther("0.002"),
            gasLimit: 300000,
            gasPrice: 2000000,
        })

    console.log(
        "Sent looped exec, waiting for confirmations...",
        simplifiedLoopedExecInitiateResponse.hash
    )

    await simplifiedLoopedExecInitiateResponse.wait(2)

    console.log("Success!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
