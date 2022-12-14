/**
 * Checks the doctype of the current document if it exists
 *
 * returns {boolean} {@code true} if the doctype is html or if none exists
 */
export function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}
