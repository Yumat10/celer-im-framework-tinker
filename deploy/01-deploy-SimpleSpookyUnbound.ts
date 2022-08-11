import { verify } from "../utils/verify"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

// Goerli contract: 0xD703933b591d2304F6e4C88971E0A46e019f839a
// FTM testnet contract: 0x964CCAf6487466F64Df2048c60816E079008C592

const GOERLI_MESSAGE_BUS = "0xF25170F86E4291a99a9A560032Fe9948b8BcFBB2"
const FTM_TESTNET_MESSAGE_BUS = "0xb92d6933A024bcca9A21669a480C236Cbc973110"

const deploySimpleSpookyUnbound: DeployFunction = async function (
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
            "Invalid network chosen for deploying SimpleSpookyUnbound. Use goerli or ftmTestnet."
        )
        return
    }

    const SimpleSpookyUnboundDeployResponse = await deploy(
        "SimpleSpookyUnbound",
        {
            from: deployer,
            args,
            log: true,
            waitConfirmations: 3,
        }
    )

    console.log(
        "Deployed SimpleSpookyUnbound to: ",
        SimpleSpookyUnboundDeployResponse.address
    )

    // await verify(SimpleSpookyUnboundDeployResponse.address, args)
}

export default deploySimpleSpookyUnbound
deploySimpleSpookyUnbound.tags = ["all", "spookyUnbound"]
