// src/EIP6963.ts
import { isObject } from "@metamask/utils";
var UUID_V4_REGEX = /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;
var FQDN_REGEX = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/u;
function requestProvider(handleProvider) {
  window.addEventListener(
    "eip6963:announceProvider" /* Announce */,
    (event) => {
      if (!isValidAnnounceProviderEvent(event)) {
        throwErrorEIP6963(
          `Invalid EIP-6963 AnnounceProviderEvent object received from ${"eip6963:announceProvider" /* Announce */} event.`
        );
      }
      handleProvider(event.detail);
    }
  );
  window.dispatchEvent(new Event("eip6963:requestProvider" /* Request */));
}
function announceProvider(providerDetail) {
  if (!isValidProviderDetail(providerDetail)) {
    throwErrorEIP6963("Invalid EIP-6963 ProviderDetail object.");
  }
  const { info, provider } = providerDetail;
  const _announceProvider = () => window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider" /* Announce */, {
      detail: Object.freeze({ info: { ...info }, provider })
    })
  );
  _announceProvider();
  window.addEventListener(
    "eip6963:requestProvider" /* Request */,
    (event) => {
      if (!isValidRequestProviderEvent(event)) {
        throwErrorEIP6963(
          `Invalid EIP-6963 RequestProviderEvent object received from ${"eip6963:requestProvider" /* Request */} event.`
        );
      }
      _announceProvider();
    }
  );
}
function isValidRequestProviderEvent(event) {
  return event instanceof Event && event.type === "eip6963:requestProvider" /* Request */;
}
function isValidAnnounceProviderEvent(event) {
  return event instanceof CustomEvent && event.type === "eip6963:announceProvider" /* Announce */ && Object.isFrozen(event.detail) && isValidProviderDetail(event.detail);
}
function isValidProviderDetail(providerDetail) {
  if (!isObject(providerDetail) || !isObject(providerDetail.info) || !isObject(providerDetail.provider)) {
    return false;
  }
  const { info } = providerDetail;
  return typeof info.uuid === "string" && UUID_V4_REGEX.test(info.uuid) && typeof info.name === "string" && Boolean(info.name) && typeof info.icon === "string" && info.icon.startsWith("data:image") && typeof info.rdns === "string" && FQDN_REGEX.test(info.rdns);
}
function throwErrorEIP6963(message) {
  throw new Error(
    `${message} See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`
  );
}

export {
  requestProvider,
  announceProvider
};
//# sourceMappingURL=chunk-ZUJYX37P.mjs.map