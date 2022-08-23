import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS } from "../scripts/execDefiConstants"
import { verify } from "../utils/verify"

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

    const args = [GOERLI_MESSAGE_BUS_CONTRACT_ADDRESS]

    const goerliCelerBridgeDeployResponse = await deploy("GoerliCelerBridge", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 2,
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

    // // Set the bridge contract address in the proxy
    // console.log("Updating the bridge address in the proxy...")
    // const goerliCelerBridgeProxy: GoerliCelerBridgeProxy = await ethers.getContractAt(
    //     "GoerliCelerBridgeProxy",
    //     GOERLI_BRIDGE_PROXY_CONTRACT_ADDRESS,
    //     deployer
    // )
    // const setBridgeAddressResponse = await goerliCelerBridgeProxy.setGoerliCelerBridgeAddress(goerliCelerBridgeDeployResponse.address);
    // console.log("Sent update tx...", setBridgeAddressResponse.hash)
    // await setBridgeAddressResponse.wait(2)
    // console.log("Successfully updated bridge contract address")
}

export default deployGoerliCelerBridge
deployGoerliCelerBridge.tags = ["all", "exec-defi", "goerli-celer-bridge"]
