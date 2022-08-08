export const waitPromise = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });

export const shouldForceInjectProvider = (forceInjectProvider) => {
  // @ts-ignore
  return forceInjectProvider || window.navigator.brave
}
