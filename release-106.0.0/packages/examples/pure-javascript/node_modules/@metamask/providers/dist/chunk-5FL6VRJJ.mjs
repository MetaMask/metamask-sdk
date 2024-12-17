import {
  ERC1155,
  ERC721
} from "./chunk-I6HXGZRD.mjs";
import {
  messages_default
} from "./chunk-ZGDQ3IYD.mjs";

// src/middleware/createRpcWarningMiddleware.ts
function createRpcWarningMiddleware(log) {
  const sentWarnings = {
    ethDecryptDeprecation: false,
    ethGetEncryptionPublicKeyDeprecation: false,
    walletWatchAssetNFTExperimental: false
  };
  return (req, _res, next) => {
    if (!sentWarnings.ethDecryptDeprecation && req.method === "eth_decrypt") {
      log.warn(messages_default.warnings.rpc.ethDecryptDeprecation);
      sentWarnings.ethDecryptDeprecation = true;
    } else if (!sentWarnings.ethGetEncryptionPublicKeyDeprecation && req.method === "eth_getEncryptionPublicKey") {
      log.warn(messages_default.warnings.rpc.ethGetEncryptionPublicKeyDeprecation);
      sentWarnings.ethGetEncryptionPublicKeyDeprecation = true;
    } else if (!sentWarnings.walletWatchAssetNFTExperimental && req.method === "wallet_watchAsset" && [ERC721, ERC1155].includes(
      req.params?.type || ""
    )) {
      log.warn(messages_default.warnings.rpc.walletWatchAssetNFTExperimental);
      sentWarnings.walletWatchAssetNFTExperimental = true;
    }
    next();
  };
}

export {
  createRpcWarningMiddleware
};
//# sourceMappingURL=chunk-5FL6VRJJ.mjs.map