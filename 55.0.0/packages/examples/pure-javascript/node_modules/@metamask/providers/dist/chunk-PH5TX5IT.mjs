import {
  MetaMaskInpageProviderStreamName
} from "./chunk-URMSZO7Z.mjs";
import {
  StreamProvider
} from "./chunk-UTROHXPT.mjs";
import {
  getDefaultExternalMiddleware
} from "./chunk-ZN7WV55J.mjs";

// src/extension-provider/createExternalExtensionProvider.ts
import { detect } from "detect-browser";
import PortStream from "extension-port-stream";

// src/extension-provider/external-extension-config.json
var external_extension_config_default = {
  chromeIds: {
    stable: "nkbihfbeogaeaoehlefnkodbefgpgknn",
    beta: "pbbkamfgmaedccnfkmjcofcecjhfgldn",
    flask: "ljfoeinjpaedjfecbmggjgodbgkmjkjk"
  },
  firefoxIds: {
    stable: "webextension@metamask.io",
    beta: "webextension-beta@metamask.io",
    flask: "webextension-flask@metamask.io"
  }
};

// src/extension-provider/createExternalExtensionProvider.ts
var browser = detect();
function createExternalExtensionProvider(typeOrId = "stable") {
  let provider;
  try {
    const extensionId = getExtensionId(typeOrId);
    const metamaskPort = chrome.runtime.connect(extensionId);
    const pluginStream = new PortStream(metamaskPort);
    provider = new StreamProvider(pluginStream, {
      jsonRpcStreamName: MetaMaskInpageProviderStreamName,
      logger: console,
      rpcMiddleware: getDefaultExternalMiddleware(console)
    });
    provider.initialize();
  } catch (error) {
    console.dir(`MetaMask connect error.`, error);
    throw error;
  }
  return provider;
}
function getExtensionId(typeOrId) {
  const ids = browser?.name === "firefox" ? external_extension_config_default.firefoxIds : external_extension_config_default.chromeIds;
  return ids[typeOrId] ?? typeOrId;
}

export {
  createExternalExtensionProvider
};
//# sourceMappingURL=chunk-PH5TX5IT.mjs.map