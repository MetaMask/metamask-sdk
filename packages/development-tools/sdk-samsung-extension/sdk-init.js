const sdk = new MetaMaskSDK.MetaMaskSDK({
  forceInjectProvider: typeof window.ethereum === 'undefined',
  dappMetadata: {
    url: window.location.host,
    name: `${document.title} (MMSDK Ext)`,
  },
});
