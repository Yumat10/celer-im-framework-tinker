import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/types"

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli"
const BSC_TESTNET_RPC_URL =
    process.env.BSC_TESTNET_RPC_URL || "https://bsc-testnet"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "key"
const FTMTESTNETSCAN_API_KEY = process.env.FTMTESTNETSCAN_API_KEY || "key"

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.4.18",
            },
            {
                version: "0.8.9",
            },
            {
                version: "0.8.10",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/",
        },
        goerli: {
            chainId: 5,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        // bscTestnet: {
        //     chainId: 97,
        //     url: BSC_TESTNET_RPC_URL,
        //     accounts: [PRIVATE_KEY],
        // },
        ftmTestnet: {
            chainId: 4002,
            url: "https://rpc.testnet.fantom.network",
            accounts: [PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    mocha: {
        timeout: 300 * 1000,
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
            bscTestnet: BSCSCAN_API_KEY,
            ftmTestnet: FTMTESTNETSCAN_API_KEY,
        },
    },
}

export default config
