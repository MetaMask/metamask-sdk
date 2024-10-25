"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/logging.ts
var _debug = require('debug'); var _debug2 = _interopRequireDefault(_debug);
var globalLogger = _debug2.default.call(void 0, "metamask");
function createProjectLogger(projectName) {
  return globalLogger.extend(projectName);
}
function createModuleLogger(projectLogger, moduleName) {
  return projectLogger.extend(moduleName);
}




exports.createProjectLogger = createProjectLogger; exports.createModuleLogger = createModuleLogger;
//# sourceMappingURL=chunk-2LBGT4GH.js.map