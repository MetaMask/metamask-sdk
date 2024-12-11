"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }

var _chunk6ZDHSOUVjs = require('./chunk-6ZDHSOUV.js');

// src/base64.ts
var _superstruct = require('superstruct');
var base64 = (struct, options = {}) => {
  const paddingRequired = _nullishCoalesce(options.paddingRequired, () => ( false));
  const characterSet = _nullishCoalesce(options.characterSet, () => ( "base64"));
  let letters;
  if (characterSet === "base64") {
    letters = String.raw`[A-Za-z0-9+\/]`;
  } else {
    _chunk6ZDHSOUVjs.assert.call(void 0, characterSet === "base64url");
    letters = String.raw`[-_A-Za-z0-9]`;
  }
  let re;
  if (paddingRequired) {
    re = new RegExp(
      `^(?:${letters}{4})*(?:${letters}{3}=|${letters}{2}==)?$`,
      "u"
    );
  } else {
    re = new RegExp(
      `^(?:${letters}{4})*(?:${letters}{2,3}|${letters}{3}=|${letters}{2}==)?$`,
      "u"
    );
  }
  return _superstruct.pattern.call(void 0, struct, re);
};



exports.base64 = base64;
//# sourceMappingURL=chunk-6NZW4WK4.js.map