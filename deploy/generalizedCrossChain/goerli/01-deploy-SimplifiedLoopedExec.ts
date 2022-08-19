import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../../../utils/verify"

const deploySimplifiedLoopedExec: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (network.name !== "goerli") {
        console.log("Network is not goerli, avoiding deploy")
        return
    }

    const SimplifiedLoopedExecDeployResponse = await deploy(
        "SimplifiedLoopedExec",
        {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: 1,
        }
    )

    log(
        "Deployed SimplifiedLoopedExec to: ",
        SimplifiedLoopedExecDeployResponse.address
    )

    try {
        await verify(SimplifiedLoopedExecDeployResponse.address, [])
    } catch (error) {
        console.log(error)
    }
}

export default deploySimplifiedLoopedExec
deploySimplifiedLoopedExec.tags = ["all", "simplified-looped-goerli"]
