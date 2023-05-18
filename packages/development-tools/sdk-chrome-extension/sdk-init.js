const sdk = new MetaMaskSDK.MetaMaskSDK({
  forceInjectProvider: true,
  dappMetadata: {
    url: window.location.href,
    name: `${document.title} (MMSDK Ext)`,
  },
  // enableDebug: true,
  // logging: {
  //   sdk: true,
  //   developerMode: true,
  //   eciesLayer: true,
  //   remoteLayer: true,
  //   keyExchangeLayer: true,
  //   serviceLayer: true,
  // },
  // checkInstallationImmediately: false,
  // checkInstallationOnAllCalls: false,
  // preferDesktop: true,
  // autoConnect: false,
});
