export const waitPromise = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });

export const shouldForceInjectProvider = (forceInjectProvider) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return forceInjectProvider || window.navigator.brave;
};
