"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkHP7EYLLYjs = require('./chunk-HP7EYLLY.js');


var _chunkDWR5HIZKjs = require('./chunk-DWR5HIZK.js');


var _chunkO5ECOCX2js = require('./chunk-O5ECOCX2.js');

// src/extension-provider/createExternalExtensionProvider.ts
var _detectbrowser = require('detect-browser');
var _extensionportstream = require('extension-port-stream'); var _extensionportstream2 = _interopRequireDefault(_extensionportstream);

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
var browser = _detectbrowser.detect.call(void 0, );
function createExternalExtensionProvider(typeOrId = "stable") {
  let provider;
  try {
    const extensionId = getExtensionId(typeOrId);
    const metamaskPort = chrome.runtime.connect(extensionId);
    const pluginStream = new (0, _extensionportstream2.default)(metamaskPort);
    provider = new (0, _chunkDWR5HIZKjs.StreamProvider)(pluginStream, {
      jsonRpcStreamName: _chunkHP7EYLLYjs.MetaMaskInpageProviderStreamName,
      logger: console,
      rpcMiddleware: _chunkO5ECOCX2js.getDefaultExternalMiddleware.call(void 0, console)
    });
    provider.initialize();
  } catch (error) {
    console.dir(`MetaMask connect error.`, error);
    throw error;
  }
  return provider;
}
function getExtensionId(typeOrId) {
  const ids = _optionalChain([browser, 'optionalAccess', _ => _.name]) === "firefox" ? external_extension_config_default.firefoxIds : external_extension_config_default.chromeIds;
  return _nullishCoalesce(ids[typeOrId], () => ( typeOrId));
}



exports.createExternalExtensionProvider = createExternalExtensionProvider;
//# sourceMappingURL=chunk-KUKZKOBU.js.map