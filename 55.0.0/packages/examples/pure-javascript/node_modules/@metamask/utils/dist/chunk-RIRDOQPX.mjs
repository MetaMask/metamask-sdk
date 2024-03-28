// src/logging.ts
import debug from "debug";
var globalLogger = debug("metamask");
function createProjectLogger(projectName) {
  return globalLogger.extend(projectName);
}
function createModuleLogger(projectLogger, moduleName) {
  return projectLogger.extend(moduleName);
}

export {
  createProjectLogger,
  createModuleLogger
};
//# sourceMappingURL=chunk-RIRDOQPX.mjs.map