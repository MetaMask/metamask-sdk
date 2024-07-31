import {
  assertStruct
} from "./chunk-74DGVJVE.mjs";

// src/versions.ts
import {
  gt as gtSemver,
  gtr as gtrSemver,
  satisfies as satisfiesSemver,
  valid as validSemVerVersion,
  validRange as validSemVerRange
} from "semver";
import { is, refine, string } from "superstruct";
var VersionStruct = refine(
  string(),
  "Version",
  (value) => {
    if (validSemVerVersion(value) === null) {
      return `Expected SemVer version, got "${value}"`;
    }
    return true;
  }
);
var VersionRangeStruct = refine(
  string(),
  "Version range",
  (value) => {
    if (validSemVerRange(value) === null) {
      return `Expected SemVer range, got "${value}"`;
    }
    return true;
  }
);
function isValidSemVerVersion(version) {
  return is(version, VersionStruct);
}
function isValidSemVerRange(versionRange) {
  return is(versionRange, VersionRangeStruct);
}
function assertIsSemVerVersion(version) {
  assertStruct(version, VersionStruct);
}
function assertIsSemVerRange(range) {
  assertStruct(range, VersionRangeStruct);
}
function gtVersion(version1, version2) {
  return gtSemver(version1, version2);
}
function gtRange(version, range) {
  return gtrSemver(version, range);
}
function satisfiesVersionRange(version, versionRange) {
  return satisfiesSemver(version, versionRange, {
    includePrerelease: true
  });
}

export {
  VersionStruct,
  VersionRangeStruct,
  isValidSemVerVersion,
  isValidSemVerRange,
  assertIsSemVerVersion,
  assertIsSemVerRange,
  gtVersion,
  gtRange,
  satisfiesVersionRange
};
//# sourceMappingURL=chunk-ROQSKDP5.mjs.map