console.log("before initialise", window.ethereum);

let sdk;
console.log("initialise", window.ethereum);

sdk = new MetaMaskSDK.MetaMaskSDK({
  forceInjectProvider: true,
  // enableDebug: true,
  // logging: {
  //   sdk: true,
  //   developerMode: true,
  //   eciesLayer: true,
  //   remoteLayer: true,
  //   keyExchangeLayer: true,
  //   serviceLayer: true,
  // },
  // // checkInstallationImmediately: false,
  // // checkInstallationOnAllCalls: false,
  // // preferDesktop: true,
  // // autoConnect: false,
});
