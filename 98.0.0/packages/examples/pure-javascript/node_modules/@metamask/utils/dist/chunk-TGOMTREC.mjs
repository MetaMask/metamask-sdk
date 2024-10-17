// src/caip-types.ts
import { is, pattern, string } from "superstruct";
var CAIP_CHAIN_ID_REGEX = /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})$/u;
var CAIP_NAMESPACE_REGEX = /^[-a-z0-9]{3,8}$/u;
var CAIP_REFERENCE_REGEX = /^[-_a-zA-Z0-9]{1,32}$/u;
var CAIP_ACCOUNT_ID_REGEX = /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})):(?<accountAddress>[-.%a-zA-Z0-9]{1,128})$/u;
var CAIP_ACCOUNT_ADDRESS_REGEX = /^[-.%a-zA-Z0-9]{1,128}$/u;
var CaipChainIdStruct = pattern(string(), CAIP_CHAIN_ID_REGEX);
var CaipNamespaceStruct = pattern(string(), CAIP_NAMESPACE_REGEX);
var CaipReferenceStruct = pattern(string(), CAIP_REFERENCE_REGEX);
var CaipAccountIdStruct = pattern(string(), CAIP_ACCOUNT_ID_REGEX);
var CaipAccountAddressStruct = pattern(
  string(),
  CAIP_ACCOUNT_ADDRESS_REGEX
);
function isCaipChainId(value) {
  return is(value, CaipChainIdStruct);
}
function isCaipNamespace(value) {
  return is(value, CaipNamespaceStruct);
}
function isCaipReference(value) {
  return is(value, CaipReferenceStruct);
}
function isCaipAccountId(value) {
  return is(value, CaipAccountIdStruct);
}
function isCaipAccountAddress(value) {
  return is(value, CaipAccountAddressStruct);
}
function parseCaipChainId(caipChainId) {
  const match = CAIP_CHAIN_ID_REGEX.exec(caipChainId);
  if (!match?.groups) {
    throw new Error("Invalid CAIP chain ID.");
  }
  return {
    namespace: match.groups.namespace,
    reference: match.groups.reference
  };
}
function parseCaipAccountId(caipAccountId) {
  const match = CAIP_ACCOUNT_ID_REGEX.exec(caipAccountId);
  if (!match?.groups) {
    throw new Error("Invalid CAIP account ID.");
  }
  return {
    address: match.groups.accountAddress,
    chainId: match.groups.chainId,
    chain: {
      namespace: match.groups.namespace,
      reference: match.groups.reference
    }
  };
}

export {
  CAIP_CHAIN_ID_REGEX,
  CAIP_NAMESPACE_REGEX,
  CAIP_REFERENCE_REGEX,
  CAIP_ACCOUNT_ID_REGEX,
  CAIP_ACCOUNT_ADDRESS_REGEX,
  CaipChainIdStruct,
  CaipNamespaceStruct,
  CaipReferenceStruct,
  CaipAccountIdStruct,
  CaipAccountAddressStruct,
  isCaipChainId,
  isCaipNamespace,
  isCaipReference,
  isCaipAccountId,
  isCaipAccountAddress,
  parseCaipChainId,
  parseCaipAccountId
};
//# sourceMappingURL=chunk-TGOMTREC.mjs.map