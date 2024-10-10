import {
  base64
} from "./chunk-NQMRFZHB.mjs";

// src/checksum.ts
import { size, string } from "superstruct";
var ChecksumStruct = size(
  base64(string(), { paddingRequired: true }),
  44,
  44
);

export {
  ChecksumStruct
};
//# sourceMappingURL=chunk-GZS3IQBZ.mjs.map