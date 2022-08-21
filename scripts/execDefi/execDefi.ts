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

    // Encode "Bridge contract"
    const goerliBridgeProxyABI = [
        "function goerliToFantomTestnetBridgeProxy(address _receiver,  address _token,  uint256 _amount,  address originalAddress, address[] calldata tos, bytes[] memory datas, uint256 _value)",
    ]
    const goerliBridgeProxyIface = new ethers.utils.Interface(
        goerliBridgeProxyABI
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
    const goerliBridgeProxyFuncEncoded =
        goerliBridgeProxyIface.encodeFunctionData(
            "goerliToFantomTestnetBridgeProxy",
            [
                FANTOM_TESTNET_BRIDGE_CONTRACT_ADDRESS,
                USDT_TOKEN_ADDRESS,
                USDT_TOKEN_AMOUNT,
                deployer,
                tosOnFantomTestnet,
                datasOnFantomTestnet,
                ethers.utils.parseEther("0.001"),
            ]
        )

    // const goerliBridgeTestFuncABI = ["function testFunc(uint256 _testValue)"]
    // const goerliBridgeTestFuncIface = new ethers.utils.Interface(
    //     goerliBridgeTestFuncABI
    // )
    // const goerliBridgeTestFuncEncoded =
    //     goerliBridgeTestFuncIface.encodeFunctionData("testFunc", [51])

    console.log("Encoded functions to be called by Goerli execs()!")

    // Approve USDT for transfer by Goerli bridge contract
    const USDTContract: IERC20 = await ethers.getContractAt(
        "IERC20",
        USDT_TOKEN_ADDRESS,
        deployer
    )

    // Approve USDT transfer
    // console.log("USDT approval...")
    // const approvalTx = await USDTContract.approve(
    //     GOERLI_BRIDGE_CONTRACT_ADDRESS,
    //     USDT_TOKEN_AMOUNT
    // )
    // console.log("Sent USDT approval...", approvalTx.hash)
    // await approvalTx.wait(2)
    // console.log("Approved USDT token transfer on behalf of user")

    // Send ETH to Goerli bridge proxy
    console.log("Sending eth to Goerli bridge proxy...")
    const deployerSigner = await ethers.getSigner(deployer)
    const sendETHResponse = await deployerSigner.sendTransaction({
        to: GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS,
        value: ethers.utils.parseEther("0.0015"),
        gasLimit: 300000,
        gasPrice: 2000000,
    })
    console.log("Sent tx: ", sendETHResponse.hash)
    await sendETHResponse.wait(2)
    console.log("Sent eth to Goerli bridge proxy")

    // Get SimplifiedLoopedExec contract
    const simplifiedLoopedExec: SimplifiedLoopedExec =
        await ethers.getContractAt(
            "SimplifiedLoopedExec",
            SIMPLIFIED_LOOPED_EXEC_CONTRACT_ADDRESS,
            deployer
        )

    // Call initiate function to kick start execs process
    console.log("Initiate looped exec call on Goerli")
    const tos = [GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS]
    const datas = [goerliBridgeProxyFuncEncoded]
    // const datas = [goerliBridgeTestFuncEncoded]

    console.log("tos...", tos)
    console.log("datas...", datas)
    const simplifiedLoopedExecInitiateResponse =
        await simplifiedLoopedExec.initiate(tos, datas, {
            gasLimit: 300000,
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
