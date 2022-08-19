import { AbiCoder } from "@ethersproject/abi"
import { ethers, getNamedAccounts } from "hardhat"
import { SimplifiedLoopedExec } from "../typechain-types"
import { SimpleToContract } from "../typechain-types/contracts/generalizedCrossChain/goerli/SimpleToContract"

// Contract address: 0x81966FaC48E76910594Db12878d5d43eD6b37598

async function main() {
    const { deployer } = await getNamedAccounts()

    // const simpleToContract: SimpleToContract = await ethers.getContractAt(
    //     "SimpleToContract",
    //     "0xf640d6F15d15f9Eee775d5b8b7d474BC21dA990f",
    //     deployer
    // )

    // const testFuncResponse = await simpleToContract.testFunc(256)
    // await testFuncResponse.wait(1)

    // return

    // Get looped exec contract
    const SimplifiedLoopedExec: SimplifiedLoopedExec =
        await ethers.getContractAt(
            "SimplifiedLoopedExec",
            "0x81966FaC48E76910594Db12878d5d43eD6b37598",
            deployer
        )

    // Call looped exec with approve function
    const testToContract = "0xf640d6F15d15f9Eee775d5b8b7d474BC21dA990f"
    const tos = [testToContract, testToContract]

    const ABI = ["function testFunc(uint256 testUint256)"]
    const iface = new ethers.utils.Interface(ABI)
    const testFuncEncoded0 = iface.encodeFunctionData("testFunc", [51])
    const testFuncEncoded1 = iface.encodeFunctionData("testFunc", [10])

    const datas = [testFuncEncoded0, testFuncEncoded1]

    const simplifiedLoopedExecInitiateResponse =
        await SimplifiedLoopedExec.initiate(tos, datas, {
            gasLimit: 210000,
            gasPrice: 2000000,
        })

    console.log(
        "Sent looped exec, waiting for confirmations...",
        simplifiedLoopedExecInitiateResponse.hash
    )

    await simplifiedLoopedExecInitiateResponse.wait(3)

    console.log("Success!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
