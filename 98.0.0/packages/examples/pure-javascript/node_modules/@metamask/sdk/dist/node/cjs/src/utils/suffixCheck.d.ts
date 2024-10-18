/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * returns {boolean} whether or not the extension of the current document is prohibited
 */
export declare function suffixCheck(): boolean;
//# sourceMappingURL=suffixCheck.d.ts.map