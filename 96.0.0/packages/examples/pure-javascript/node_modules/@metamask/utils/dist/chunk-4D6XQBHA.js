"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk6ZDHSOUVjs = require('./chunk-6ZDHSOUV.js');

// src/versions.ts






var _semver = require('semver');
var _superstruct = require('superstruct');
var VersionStruct = _superstruct.refine.call(void 0, 
  _superstruct.string.call(void 0, ),
  "Version",
  (value) => {
    if (_semver.valid.call(void 0, value) === null) {
      return `Expected SemVer version, got "${value}"`;
    }
    return true;
  }
);
var VersionRangeStruct = _superstruct.refine.call(void 0, 
  _superstruct.string.call(void 0, ),
  "Version range",
  (value) => {
    if (_semver.validRange.call(void 0, value) === null) {
      return `Expected SemVer range, got "${value}"`;
    }
    return true;
  }
);
function isValidSemVerVersion(version) {
  return _superstruct.is.call(void 0, version, VersionStruct);
}
function isValidSemVerRange(versionRange) {
  return _superstruct.is.call(void 0, versionRange, VersionRangeStruct);
}
function assertIsSemVerVersion(version) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, version, VersionStruct);
}
function assertIsSemVerRange(range) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, range, VersionRangeStruct);
}
function gtVersion(version1, version2) {
  return _semver.gt.call(void 0, version1, version2);
}
function gtRange(version, range) {
  return _semver.gtr.call(void 0, version, range);
}
function satisfiesVersionRange(version, versionRange) {
  return _semver.satisfies.call(void 0, version, versionRange, {
    includePrerelease: true
  });
}











exports.VersionStruct = VersionStruct; exports.VersionRangeStruct = VersionRangeStruct; exports.isValidSemVerVersion = isValidSemVerVersion; exports.isValidSemVerRange = isValidSemVerRange; exports.assertIsSemVerVersion = assertIsSemVerVersion; exports.assertIsSemVerRange = assertIsSemVerRange; exports.gtVersion = gtVersion; exports.gtRange = gtRange; exports.satisfiesVersionRange = satisfiesVersionRange;
//# sourceMappingURL=chunk-4D6XQBHA.js.map