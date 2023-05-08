/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} if the documentElement is an html node or if none exists
 */
export function documentElementCheck() {
  if (typeof document === 'undefined') {
    return false;
  }
  const documentElement = document?.documentElement?.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
