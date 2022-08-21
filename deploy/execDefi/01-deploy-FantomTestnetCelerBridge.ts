import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { verify } from "../../utils/verify"

// Contract address: 0x006E80ac87AE498Fd0508BAD291ABA80fC7F3fda

const FTM_TESTNET_MESSAGE_BUS = "0xb92d6933A024bcca9A21669a480C236Cbc973110"

const deployFantomTestnetCelerBridge: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    if (network.name !== "ftmTestnet") {
        console.log(
            "Not on ftmTestnet => not deploying FantomTestnetCelerBridge"
        )
        return
    }

    const args = [FTM_TESTNET_MESSAGE_BUS]

    const fantomTestnetCelerBridgeDeployResponse = await deploy(
        "FantomTestnetCelerBridge",
        {
            from: deployer,
            args,
            log: true,
            waitConfirmations: 3,
        }
    )

    console.log(
        "Deployed FantomTestnetCelerBridge to: ",
        fantomTestnetCelerBridgeDeployResponse.address
    )

    // try {
    //     await verify(fantomTestnetCelerBridgeDeployResponse.address, args)
    // } catch (error) {
    //     console.log(error)
    // }
}

export default deployFantomTestnetCelerBridge
deployFantomTestnetCelerBridge.tags = [
    "all",
    "exec-defi",
    "fantom-testnet-celer-bridge",
]
