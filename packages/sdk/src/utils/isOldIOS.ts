// Detect iOS browsers < version 10
export const isOldIOS = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    parseFloat(
      `${
        // eslint-disable-next-line require-unicode-regexp
        (/CPU.*OS ([0-9_]{3,4})[0-9_]{0,1}|(CPU like).*AppleWebKit.*Mobile/i.exec(
          navigator.userAgent,
        ) || [0, ''])[1]
      }`
        .replace('undefined', '3_2')
        .replace('_', '.')
        .replace('_', ''),
    ) < 10 &&
    !window.MSStream
  );
};
