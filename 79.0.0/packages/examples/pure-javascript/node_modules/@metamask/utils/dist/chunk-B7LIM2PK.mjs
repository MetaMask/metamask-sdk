// src/promise.ts
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

export {
  createDeferredPromise
};
//# sourceMappingURL=chunk-B7LIM2PK.mjs.map