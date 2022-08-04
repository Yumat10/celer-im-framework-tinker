import { verify } from "../utils/verify"

async function main() {
    await verify("0x2AE892D2988C070EeCb50CD86B8cF14824f47456", [
        "0xAd204986D6cB67A5Bc76a3CB8974823F43Cb9AAA",
    ])
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
