import { verify } from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// Goerli contract: 0x718245442D42794f62B1242D4b9e6c1aa488b168
// BSC testnet contract: 0xeb2A4Ab39306F26042871b134C0D4E43694499d6

const GOERLI_MESSAGE_BUS = "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2"
const BSC_TESTNET_MESSAGE_BUS = "0xAd204986D6cB67A5Bc76a3CB8974823F43Cb9AAA"

const deploySimpleBatchTransfer: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let args: string[]

    if (network.name === "goerli") {
        console.log("goerli message bus: ", GOERLI_MESSAGE_BUS)
        args = [GOERLI_MESSAGE_BUS]
    } else if (network.name === "bscTestnet") {
        console.log("bscTestnet message bus: ", BSC_TESTNET_MESSAGE_BUS)
        args = [BSC_TESTNET_MESSAGE_BUS]
    } else {
        console.log(
            "Invalid network chosen for deploying SimpleBatchTransfer. Use goerli or bscTestnet."
        )
        return
    }

    const SimpleBatchTransferDeployResponse = await deploy(
        "SimpleBatchTransfer",
        {
            from: deployer,
            args,
            log: true,
            waitConfirmations: 3,
        }
    )

    console.log(
        "Deployed SimpleBatchTransfer to: ",
        SimpleBatchTransferDeployResponse.address
    )

    await verify(SimpleBatchTransferDeployResponse.address, args)
}

export default deploySimpleBatchTransfer
deploySimpleBatchTransfer.tags = ["all", "simpleBatchTransfer"]
