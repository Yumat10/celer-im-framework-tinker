import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
    FANTOM_TESTNET_MESSAGE_BUS_CONTRACT_ADDRESS,
    GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS,
} from "../scripts/execDefiConstants"

const deploySpookyUnbound: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let args: string[]

    if (network.name === "goerli") {
        console.log("goerli message bus: ", GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS)
        args = [GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS]
    } else if (network.name === "ftmTestnet") {
        console.log(
            "ftmTestnet message bus: ",
            FANTOM_TESTNET_MESSAGE_BUS_CONTRACT_ADDRESS
        )
        args = [FANTOM_TESTNET_MESSAGE_BUS_CONTRACT_ADDRESS]
    } else {
        console.log(
            "Invalid network chosen for deploying SpookyUnbound. Use goerli or ftmTestnet."
        )
        return
    }

    const SpookyUnboundDeployResponse = await deploy("SpookyUnbound", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 3,
    })

    console.log(
        "Deployed SpookyUnbound to: ",
        SpookyUnboundDeployResponse.address
    )

    // await verify(SpookyUnboundDeployResponse.address, args)
}

export default deploySpookyUnbound
deploySpookyUnbound.tags = ["all", "spookyUnbound"]
