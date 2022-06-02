const fs = require("fs")
const bundle = fs.readFileSync('../../sdk/dist/browser/iife/metamask-sdk.js')

const file = `
${bundle};
const sdk = new MetaMaskSDK({useDeeplink: true});
console.log("SDK Loaded", sdk)
`

fs.writeFileSync("source/assets/sdk.js", file)