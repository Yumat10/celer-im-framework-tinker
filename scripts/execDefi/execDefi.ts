import { ethers, getNamedAccounts } from "hardhat"
import { IERC20, SimplifiedLoopedExec } from "../../typechain-types"
import {
    SPOOKYSWAP_CONTACT_ADDRESS,
    USDT_TOKEN_ADDRESS,
    TUSDT_TOKEN_ADDRESS,
    FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
    TUSDC_TOKEN_ADDRESS,
    UNBOUND_ROUTER_CONTRACT_ADDRESS,
    USDT_TOKEN_AMOUNT,
    GOERLI_BRIDGE_CONTRACT_ADDRESS,
    SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
    GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS,
    GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
} from "./execDefiConstants"

async function main() {
    // Get the Simplified Looped Exec Contract
    const { deployer } = await getNamedAccounts()

    /**
     * Fantom Testnet Exec functions
     * Approve USDT transfer
     * Swap USDT for TUSDT
     * Swap USDT for TUSDC
     * Provide liquidity to Unbound liquidity pool
     */

    console.log("Encoding functions to be called by Fantom Testnet execs()...")

    const TOTAL_USDT = "5000000"
    const USDT_TO_SWAP = "2500000"
    const TUSDT_LIQUIDITY_AMOUNT = "1000000"
    const TUSDC_LIQUIDITY_AMOUNT = "1000000"

    // Encode "Approve USDT transfer"
    const approveUSDTABI = [
        "function approveTokens(address _spender, uint256 _amount, address _token)",
    ]
    const approveUSDTIface = new ethers.utils.Interface(approveUSDTABI)
    const approveUSDTEncoded = approveUSDTIface.encodeFunctionData(
        "approveTokens",
        [SPOOKYSWAP_CONTACT_ADDRESS, TOTAL_USDT, USDT_TOKEN_ADDRESS]
    )

    // Encode "Swap USDT for TUSDT"
    const spookyswapSwapABI = [
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)",
    ]
    const spookyswapSwapIface = new ethers.utils.Interface(spookyswapSwapABI)
    const spookyswapSwapTUSDTEncoded = spookyswapSwapIface.encodeFunctionData(
        "swapExactTokensForTokens",
        [
            USDT_TO_SWAP,
            0,
            [USDT_TOKEN_ADDRESS, TUSDT_TOKEN_ADDRESS],
            FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
            1761087466,
        ]
    )

    // Encode "Swap USDT for TUSDC"
    const spookyswapSwapTUSDCEncoded = spookyswapSwapIface.encodeFunctionData(
        "swapExactTokensForTokens",
        [
            USDT_TO_SWAP,
            0,
            [USDT_TOKEN_ADDRESS, TUSDC_TOKEN_ADDRESS],
            FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
            1761087466,
        ]
    )

    // Encode "Provide liquidity to Unbound liquidity pool"
    const unboundAddLiquidityABI = [
        "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline)",
    ]
    const unboundAddLiquidityIface = new ethers.utils.Interface(
        unboundAddLiquidityABI
    )
    const unboundAddLiquidityEncoded =
        unboundAddLiquidityIface.encodeFunctionData("addLiquidity", [
            TUSDT_TOKEN_ADDRESS,
            TUSDC_TOKEN_ADDRESS,
            TUSDT_LIQUIDITY_AMOUNT,
            TUSDC_LIQUIDITY_AMOUNT,
            1,
            1,
            deployer,
            1761087466,
        ])

    console.log("Encoded functions to be called by Fantom Testnet execs()!")

    /**
     * Goerli Exec functions
     * Bridge Contract
     * */

    console.log("Encoding functions to be called by Goerli execs()...")


    const tempABI = ["function setGoerliCelerBridgeAddress(address _new_address)"]
    const tempIface = new ethers.utils.Interface(tempABI);
    const tempEncoded = tempIface.encodeFunctionData("setGoerliCelerBridgeAddress", 
        [
            GOERLI_BRIDGE_CONTRACT_ADDRESS
        ])
    // Encode "Bridge contract"

    // Bridge
    const goerliBridgeABI = [
        "function goerliToFantomTestnetBridge(address _receiver, address _token, uint256 _amount, address _message_bus, address originalAddress, address[] calldata tos, bytes[] memory datas)",
    ]
    const goerliBridgeIface = new ethers.utils.Interface(
        goerliBridgeABI
    )
    const tosOnFantomTestnet = [
        FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
        SPOOKYSWAP_CONTACT_ADDRESS,
        SPOOKYSWAP_CONTACT_ADDRESS,
        UNBOUND_ROUTER_CONTRACT_ADDRESS,
    ]
    const datasOnFantomTestnet = [
        approveUSDTEncoded,
        spookyswapSwapTUSDTEncoded,
        spookyswapSwapTUSDCEncoded,
        unboundAddLiquidityEncoded,
    ]
    const goerliBridgeFuncEncoded =
        goerliBridgeIface.encodeFunctionData(
            "goerliToFantomTestnetBridge",
            [
                FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
                USDT_TOKEN_ADDRESS,
                USDT_TOKEN_AMOUNT,
                GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
                deployer,
                tosOnFantomTestnet,
                datasOnFantomTestnet,
            ]
        )

// // Bridge proxy
// const goerliBridgeProxyABI = [
//     "function goerliToFantomTestnetBridgeProxy(address _receiver, address _token, uint256 _amount, address originalAddress, address[] calldata tos, bytes[] memory datas, uint256 _value)",
// ]
// const goerliBridgeProxyIface = new ethers.utils.Interface(
//     goerliBridgeProxyABI
// )
// const goerliBridgeProxyFuncEncoded =
//     goerliBridgeProxyIface.encodeFunctionData(
//         "goerliToFantomTestnetBridgeProxy",
//         [
//             FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
//             USDT_TOKEN_ADDRESS,
//             USDT_TOKEN_AMOUNT,
//             deployer,
//             tosOnFantomTestnet,
//             datasOnFantomTestnet,
//             ethers.utils.parseEther("0.001"),
//         ]
//     )


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
