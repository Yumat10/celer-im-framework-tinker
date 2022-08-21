import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../../utils/verify"

// Contract Address: 0xE860D8df58B727ee6226F13c5d5ca826919DE03b

const GOERLI_MESSAGE_BUS = "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2"

const deployGoerliCelerBridge: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    if (network.name !== "goerli") {
        console.log("Not on goerli => not deploying GoerliCelerBridge")
        return
    }

    const args = [GOERLI_MESSAGE_BUS]

    const goerliCelerBridgeDeployResponse = await deploy("GoerliCelerBridge", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 3,
    })

    console.log(
        "Deployed GoerliCelerBridge to: ",
        goerliCelerBridgeDeployResponse.address
    )

    try {
        await verify(goerliCelerBridgeDeployResponse.address, args)
    } catch (error) {
        console.log(error)
    }
}

export default deployGoerliCelerBridge
deployGoerliCelerBridge.tags = ["all", "exec-defi", "goerli-celer-bridge"]