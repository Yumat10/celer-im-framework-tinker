import { verify } from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// Goerli contract: 0x87634C84A3876482B045Bc31c721093759fcE962
// BSC testnet contract: 0x2AE892D2988C070EeCb50CD86B8cF14824f47456

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
        console.log("goerli: ", GOERLI_MESSAGE_BUS)
        args = [GOERLI_MESSAGE_BUS]
    } else if (network.name === "bscTestnet") {
        console.log("bscTestnet: ", BSC_TESTNET_MESSAGE_BUS)
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
