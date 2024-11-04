"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


var _chunkZOFGBGOMjs = require('./chunk-ZOFGBGOM.js');


var _chunk4EQNSGSRjs = require('./chunk-4EQNSGSR.js');

// src/middleware/createRpcWarningMiddleware.ts
function createRpcWarningMiddleware(log) {
  const sentWarnings = {
    ethDecryptDeprecation: false,
    ethGetEncryptionPublicKeyDeprecation: false,
    walletWatchAssetNFTExperimental: false
  };
  return (req, _res, next) => {
    if (!sentWarnings.ethDecryptDeprecation && req.method === "eth_decrypt") {
      log.warn(_chunk4EQNSGSRjs.messages_default.warnings.rpc.ethDecryptDeprecation);
      sentWarnings.ethDecryptDeprecation = true;
    } else if (!sentWarnings.ethGetEncryptionPublicKeyDeprecation && req.method === "eth_getEncryptionPublicKey") {
      log.warn(_chunk4EQNSGSRjs.messages_default.warnings.rpc.ethGetEncryptionPublicKeyDeprecation);
      sentWarnings.ethGetEncryptionPublicKeyDeprecation = true;
    } else if (!sentWarnings.walletWatchAssetNFTExperimental && req.method === "wallet_watchAsset" && [_chunkZOFGBGOMjs.ERC721, _chunkZOFGBGOMjs.ERC1155].includes(
      _optionalChain([req, 'access', _ => _.params, 'optionalAccess', _2 => _2.type]) || ""
    )) {
      log.warn(_chunk4EQNSGSRjs.messages_default.warnings.rpc.walletWatchAssetNFTExperimental);
      sentWarnings.walletWatchAssetNFTExperimental = true;
    }
    next();
  };
}



exports.createRpcWarningMiddleware = createRpcWarningMiddleware;
//# sourceMappingURL=chunk-6QNVTE4W.js.map