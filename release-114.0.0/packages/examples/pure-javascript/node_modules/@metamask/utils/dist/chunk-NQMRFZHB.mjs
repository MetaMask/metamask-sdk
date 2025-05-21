import {
  assert
} from "./chunk-74DGVJVE.mjs";

// src/base64.ts
import { pattern } from "superstruct";
var base64 = (struct, options = {}) => {
  const paddingRequired = options.paddingRequired ?? false;
  const characterSet = options.characterSet ?? "base64";
  let letters;
  if (characterSet === "base64") {
    letters = String.raw`[A-Za-z0-9+\/]`;
  } else {
    assert(characterSet === "base64url");
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
  return pattern(struct, re);
};

export {
  base64
};
//# sourceMappingURL=chunk-NQMRFZHB.mjs.map