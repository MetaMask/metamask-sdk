"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/caip-types.ts
var _superstruct = require('superstruct');
var CAIP_CHAIN_ID_REGEX = /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})$/u;
var CAIP_NAMESPACE_REGEX = /^[-a-z0-9]{3,8}$/u;
var CAIP_REFERENCE_REGEX = /^[-_a-zA-Z0-9]{1,32}$/u;
var CAIP_ACCOUNT_ID_REGEX = /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})):(?<accountAddress>[-.%a-zA-Z0-9]{1,128})$/u;
var CAIP_ACCOUNT_ADDRESS_REGEX = /^[-.%a-zA-Z0-9]{1,128}$/u;
var CaipChainIdStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), CAIP_CHAIN_ID_REGEX);
var CaipNamespaceStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), CAIP_NAMESPACE_REGEX);
var CaipReferenceStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), CAIP_REFERENCE_REGEX);
var CaipAccountIdStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), CAIP_ACCOUNT_ID_REGEX);
var CaipAccountAddressStruct = _superstruct.pattern.call(void 0, 
  _superstruct.string.call(void 0, ),
  CAIP_ACCOUNT_ADDRESS_REGEX
);
function isCaipChainId(value) {
  return _superstruct.is.call(void 0, value, CaipChainIdStruct);
}
function isCaipNamespace(value) {
  return _superstruct.is.call(void 0, value, CaipNamespaceStruct);
}
function isCaipReference(value) {
  return _superstruct.is.call(void 0, value, CaipReferenceStruct);
}
function isCaipAccountId(value) {
  return _superstruct.is.call(void 0, value, CaipAccountIdStruct);
}
function isCaipAccountAddress(value) {
  return _superstruct.is.call(void 0, value, CaipAccountAddressStruct);
}
function parseCaipChainId(caipChainId) {
  const match = CAIP_CHAIN_ID_REGEX.exec(caipChainId);
  if (!_optionalChain([match, 'optionalAccess', _ => _.groups])) {
    throw new Error("Invalid CAIP chain ID.");
  }
  return {
    namespace: match.groups.namespace,
    reference: match.groups.reference
  };
}
function parseCaipAccountId(caipAccountId) {
  const match = CAIP_ACCOUNT_ID_REGEX.exec(caipAccountId);
  if (!_optionalChain([match, 'optionalAccess', _2 => _2.groups])) {
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



















exports.CAIP_CHAIN_ID_REGEX = CAIP_CHAIN_ID_REGEX; exports.CAIP_NAMESPACE_REGEX = CAIP_NAMESPACE_REGEX; exports.CAIP_REFERENCE_REGEX = CAIP_REFERENCE_REGEX; exports.CAIP_ACCOUNT_ID_REGEX = CAIP_ACCOUNT_ID_REGEX; exports.CAIP_ACCOUNT_ADDRESS_REGEX = CAIP_ACCOUNT_ADDRESS_REGEX; exports.CaipChainIdStruct = CaipChainIdStruct; exports.CaipNamespaceStruct = CaipNamespaceStruct; exports.CaipReferenceStruct = CaipReferenceStruct; exports.CaipAccountIdStruct = CaipAccountIdStruct; exports.CaipAccountAddressStruct = CaipAccountAddressStruct; exports.isCaipChainId = isCaipChainId; exports.isCaipNamespace = isCaipNamespace; exports.isCaipReference = isCaipReference; exports.isCaipAccountId = isCaipAccountId; exports.isCaipAccountAddress = isCaipAccountAddress; exports.parseCaipChainId = parseCaipChainId; exports.parseCaipAccountId = parseCaipAccountId;
//# sourceMappingURL=chunk-U7ZUGCE7.js.map