"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _chunkIZC266HSjs = require('./chunk-IZC266HS.js');

// src/fs.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
async function readFile(filePath) {
  try {
    return await _fs2.default.promises.readFile(filePath, "utf8");
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not read file '${filePath}'`);
  }
}
async function writeFile(filePath, content) {
  try {
    await _fs2.default.promises.mkdir(_path2.default.dirname(filePath), { recursive: true });
    await _fs2.default.promises.writeFile(filePath, content);
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not write file '${filePath}'`);
  }
}
async function readJsonFile(filePath, {
  parser = JSON
} = {}) {
  try {
    const content = await _fs2.default.promises.readFile(filePath, "utf8");
    return parser.parse(content);
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not read JSON file '${filePath}'`);
  }
}
async function writeJsonFile(filePath, jsonValue, {
  stringifier = JSON,
  prettify = false
} = {}) {
  try {
    await _fs2.default.promises.mkdir(_path2.default.dirname(filePath), { recursive: true });
    const json = prettify ? stringifier.stringify(jsonValue, null, "  ") : stringifier.stringify(jsonValue);
    await _fs2.default.promises.writeFile(filePath, json);
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not write JSON file '${filePath}'`);
  }
}
async function fileExists(filePath) {
  try {
    const stats = await _fs2.default.promises.stat(filePath);
    return stats.isFile();
  } catch (error) {
    if (_chunkIZC266HSjs.isErrorWithCode.call(void 0, error) && error.code === "ENOENT") {
      return false;
    }
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not determine if file exists '${filePath}'`);
  }
}
async function directoryExists(directoryPath) {
  try {
    const stats = await _fs2.default.promises.stat(directoryPath);
    return stats.isDirectory();
  } catch (error) {
    if (_chunkIZC266HSjs.isErrorWithCode.call(void 0, error) && error.code === "ENOENT") {
      return false;
    }
    throw _chunkIZC266HSjs.wrapError.call(void 0, 
      error,
      `Could not determine if directory exists '${directoryPath}'`
    );
  }
}
async function ensureDirectoryStructureExists(directoryPath) {
  try {
    await _fs2.default.promises.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, 
      error,
      `Could not create directory structure '${directoryPath}'`
    );
  }
}
async function forceRemove(entryPath) {
  try {
    return await _fs2.default.promises.rm(entryPath, {
      recursive: true,
      force: true
    });
  } catch (error) {
    throw _chunkIZC266HSjs.wrapError.call(void 0, error, `Could not remove file or directory '${entryPath}'`);
  }
}
function createSandbox(projectName) {
  const timestamp = (/* @__PURE__ */ new Date()).getTime();
  const directoryPath = _path2.default.join(_os2.default.tmpdir(), `${projectName}--${timestamp}`);
  return {
    directoryPath,
    async withinSandbox(test) {
      if (await directoryExists(directoryPath)) {
        throw new Error(`${directoryPath} already exists. Cannot continue.`);
      }
      await ensureDirectoryStructureExists(directoryPath);
      try {
        await test({ directoryPath });
      } finally {
        await forceRemove(directoryPath);
      }
    }
  };
}











exports.readFile = readFile; exports.writeFile = writeFile; exports.readJsonFile = readJsonFile; exports.writeJsonFile = writeJsonFile; exports.fileExists = fileExists; exports.directoryExists = directoryExists; exports.ensureDirectoryStructureExists = ensureDirectoryStructureExists; exports.forceRemove = forceRemove; exports.createSandbox = createSandbox;
//# sourceMappingURL=chunk-BFQDMI3M.js.map