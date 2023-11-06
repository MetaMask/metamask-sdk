// Detect iOS browsers < version 10
export const isOldIOS = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const { userAgent } = navigator;
  const iosVersionMatch =
    /CPU (?:iPhone )?OS (\d+)(?:_\d+)?_?\d+ like Mac OS X/iu.exec(userAgent);

  if (!iosVersionMatch) {
    return false;
  }
  // on ios expected result  is: ["CPU iPhone OS 16_7_2 like Mac OS X", "16"]
  // Parse the major version number from the regex match.
  const iosVersion = parseInt(iosVersionMatch[1], 10);

  return iosVersion < 10 && !(window as any).MSStream;
};
