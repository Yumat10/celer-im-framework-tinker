import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../../../utils/verify"

// Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

const deploySimpleCelrTransferFrom: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const simpleCelrTransferFromDeployResponse = await deploy(
        "SimpleCelrTransferFrom",
        {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: 1,
        }
    )

    log(
        "Deployed SimpleCelrTransferFrom to: ",
        simpleCelrTransferFromDeployResponse.address
    )

    try {
        await verify(simpleCelrTransferFromDeployResponse.address, [])
    } catch (error) {
        console.log(error)
    }
}

export default deploySimpleCelrTransferFrom
deploySimpleCelrTransferFrom.tags = [
    "all",
    "looped-goerli",
    "looped-goerli-celr",
]
