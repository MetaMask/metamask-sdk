const sdk = new MetaMaskSDK.MetaMaskSDK({
  forceInjectProvider: typeof window.ethereum === 'undefined',
  useDeeplink: true,
  preferredOpenLink: false,
  dappMetadata: {
    url: window.location.host,
    name: `${document.title} (MMSDK Ext)`,
  },
});
