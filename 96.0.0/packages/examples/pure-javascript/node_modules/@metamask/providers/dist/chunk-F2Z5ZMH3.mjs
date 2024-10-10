// src/shimWeb3.ts
function shimWeb3(provider, log = console) {
  let loggedCurrentProvider = false;
  let loggedMissingProperty = false;
  if (!window.web3) {
    const SHIM_IDENTIFIER = "__isMetaMaskShim__";
    let web3Shim = { currentProvider: provider };
    Object.defineProperty(web3Shim, SHIM_IDENTIFIER, {
      value: true,
      enumerable: true,
      configurable: false,
      writable: false
    });
    web3Shim = new Proxy(web3Shim, {
      get: (target, property, ...args) => {
        if (property === "currentProvider" && !loggedCurrentProvider) {
          loggedCurrentProvider = true;
          log.warn(
            "You are accessing the MetaMask window.web3.currentProvider shim. This property is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"
          );
        } else if (property !== "currentProvider" && property !== SHIM_IDENTIFIER && !loggedMissingProperty) {
          loggedMissingProperty = true;
          log.error(
            `MetaMask no longer injects web3. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3`
          );
          provider.request({ method: "metamask_logWeb3ShimUsage" }).catch((error) => {
            log.debug("MetaMask: Failed to log web3 shim usage.", error);
          });
        }
        return Reflect.get(target, property, ...args);
      },
      set: (...args) => {
        log.warn(
          "You are accessing the MetaMask window.web3 shim. This object is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"
        );
        return Reflect.set(...args);
      }
    });
    Object.defineProperty(window, "web3", {
      value: web3Shim,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
}

export {
  shimWeb3
};
//# sourceMappingURL=chunk-F2Z5ZMH3.mjs.map