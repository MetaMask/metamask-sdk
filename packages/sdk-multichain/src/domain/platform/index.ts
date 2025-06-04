/**
 *
 */
export function isNotBrowser() {
  return (
    typeof window === 'undefined' ||
    !window?.navigator ||
    (typeof global !== 'undefined' &&
      global?.navigator?.product === 'ReactNative') ||
    navigator?.product === 'ReactNative'
  );
}

/**
 *
 */
export function isReactNative() {
  // Avoid grouping in single condition for readibility
  return (
    isNotBrowser() &&
    typeof window !== 'undefined' &&
    window?.navigator &&
    window.navigator?.product === 'ReactNative'
  );
}
