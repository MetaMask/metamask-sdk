const sdk = new MetaMaskSDK.MetaMaskSDK({
  forceInjectProvider: typeof window.ethereum === 'undefined',
  dappMetadata: {
    name: 'Pure JS example',
    url: window.location.host,
  },
});
