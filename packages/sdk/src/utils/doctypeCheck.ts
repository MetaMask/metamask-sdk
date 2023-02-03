/**
 * Checks the doctype of the current document if it exists
 *
 * returns {boolean} {@code true} if the doctype is html or if none exists
 */
export function doctypeCheck() {
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    return window.document?.doctype?.name === 'html';
  }
  return false;
}
