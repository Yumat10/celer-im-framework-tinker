import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { GOERLI_BRIDGE_CONTRACT_ADDRESS } from "../../scripts/execDefi/execDefiConstants"
import { verify } from "../../utils/verify"

const deployGoerliCelerBridgeProxy: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    if (network.name !== "goerli") {
        console.log("Not on goerli => not deploying GoerliCelerBridgeProxy")
        return
    }

    const args = [GOERLI_BRIDGE_CONTRACT_ADDRESS]

    const goerliCelerBridgeProxyDeployResponse = await deploy(
        "GoerliCelerBridgeProxy",
        {
            from: deployer,
            args,
            log: true,
            waitConfirmations: 3,
        }
    )

    console.log(
        "Deployed GoerliCelerBridge to: ",
        goerliCelerBridgeProxyDeployResponse.address
    )

    try {
        await verify(goerliCelerBridgeProxyDeployResponse.address, args)
    } catch (error) {
        console.log(error)
    }
}

export default deployGoerliCelerBridgeProxy
deployGoerliCelerBridgeProxy.tags = [
    "all",
    "exec-defi",
    "goerli-celer-bridge-proxy",
]
