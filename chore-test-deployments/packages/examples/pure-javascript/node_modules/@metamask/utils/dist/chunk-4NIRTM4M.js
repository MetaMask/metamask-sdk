"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/promise.ts
function createDeferredPromise({
  suppressUnhandledRejection = false
} = {}) {
  let resolve;
  let reject;
  const promise = new Promise(
    (innerResolve, innerReject) => {
      resolve = innerResolve;
      reject = innerReject;
    }
  );
  if (suppressUnhandledRejection) {
    promise.catch((_error) => {
    });
  }
  return { promise, resolve, reject };
}



exports.createDeferredPromise = createDeferredPromise;
//# sourceMappingURL=chunk-4NIRTM4M.js.map