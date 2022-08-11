import { verify } from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// Goerli contract: 0x718245442D42794f62B1242D4b9e6c1aa488b168
// FTM testnet contract: 0xF5B82F070e248233381EC34482F280756711d8e4

const GOERLI_MESSAGE_BUS = "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2"
const FTM_TESTNET_MESSAGE_BUS = "0xb92d6933A024bcca9A21669a480C236Cbc973110"

const deploySimpleSpookySwap: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let args: string[]

    if (network.name === "goerli") {
        console.log("goerli message bus: ", GOERLI_MESSAGE_BUS)
        args = [GOERLI_MESSAGE_BUS]
    } else if (network.name === "ftmTestnet") {
        console.log("ftmTestnet message bus: ", FTM_TESTNET_MESSAGE_BUS)
        args = [FTM_TESTNET_MESSAGE_BUS]
    } else {
        console.log(
            "Invalid network chosen for deploying SimpleSpookySwap. Use goerli or ftmTestnet."
        )
        return
    }

    const SimpleSpookySwapDeployResponse = await deploy("SimpleSpookySwap", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 3,
    })

    console.log(
        "Deployed SimpleSpookySwap to: ",
        SimpleSpookySwapDeployResponse.address
    )

    // await verify(SimpleSpookySwapDeployResponse.address, args)
}

export default deploySimpleSpookySwap
deploySimpleSpookySwap.tags = ["all", "spooky"]
