export const extractFavicon = () => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  let favicon;
  const nodeList = document.getElementsByTagName('link');
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < nodeList.length; i++) {
    if (
      nodeList[i].getAttribute('rel') === 'icon' ||
      nodeList[i].getAttribute('rel') === 'shortcut icon'
    ) {
      favicon = nodeList[i].getAttribute('href');
    }
  }
  return favicon;
};
