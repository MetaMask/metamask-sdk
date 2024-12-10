import {
  isErrorWithCode,
  wrapError
} from "./chunk-XYGUOY6N.mjs";

// src/fs.ts
import fs from "fs";
import os from "os";
import path from "path";
async function readFile(filePath) {
  try {
    return await fs.promises.readFile(filePath, "utf8");
  } catch (error) {
    throw wrapError(error, `Could not read file '${filePath}'`);
  }
}
async function writeFile(filePath, content) {
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, content);
  } catch (error) {
    throw wrapError(error, `Could not write file '${filePath}'`);
  }
}
async function readJsonFile(filePath, {
  parser = JSON
} = {}) {
  try {
    const content = await fs.promises.readFile(filePath, "utf8");
    return parser.parse(content);
  } catch (error) {
    throw wrapError(error, `Could not read JSON file '${filePath}'`);
  }
}
async function writeJsonFile(filePath, jsonValue, {
  stringifier = JSON,
  prettify = false
} = {}) {
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    const json = prettify ? stringifier.stringify(jsonValue, null, "  ") : stringifier.stringify(jsonValue);
    await fs.promises.writeFile(filePath, json);
  } catch (error) {
    throw wrapError(error, `Could not write JSON file '${filePath}'`);
  }
}
async function fileExists(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.isFile();
  } catch (error) {
    if (isErrorWithCode(error) && error.code === "ENOENT") {
      return false;
    }
    throw wrapError(error, `Could not determine if file exists '${filePath}'`);
  }
}
async function directoryExists(directoryPath) {
  try {
    const stats = await fs.promises.stat(directoryPath);
    return stats.isDirectory();
  } catch (error) {
    if (isErrorWithCode(error) && error.code === "ENOENT") {
      return false;
    }
    throw wrapError(
      error,
      `Could not determine if directory exists '${directoryPath}'`
    );
  }
}
async function ensureDirectoryStructureExists(directoryPath) {
  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  } catch (error) {
    throw wrapError(
      error,
      `Could not create directory structure '${directoryPath}'`
    );
  }
}
async function forceRemove(entryPath) {
  try {
    return await fs.promises.rm(entryPath, {
      recursive: true,
      force: true
    });
  } catch (error) {
    throw wrapError(error, `Could not remove file or directory '${entryPath}'`);
  }
}
function createSandbox(projectName) {
  const timestamp = (/* @__PURE__ */ new Date()).getTime();
  const directoryPath = path.join(os.tmpdir(), `${projectName}--${timestamp}`);
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

export {
  readFile,
  writeFile,
  readJsonFile,
  writeJsonFile,
  fileExists,
  directoryExists,
  ensureDirectoryStructureExists,
  forceRemove,
  createSandbox
};
//# sourceMappingURL=chunk-52OU772R.mjs.map