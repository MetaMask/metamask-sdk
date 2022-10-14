export const waitPromise = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });

export const shouldForceInjectProvider = (forceInjectProvider) => {
  return (
    forceInjectProvider ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (typeof window !== 'undefined' && window.navigator.brave)
  );
};
