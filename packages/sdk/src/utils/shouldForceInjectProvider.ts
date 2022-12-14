export const shouldForceInjectProvider = (forceInjectProvider: boolean) => {
  return (
    forceInjectProvider ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (typeof window !== 'undefined' && window.navigator.brave)
  );
};
