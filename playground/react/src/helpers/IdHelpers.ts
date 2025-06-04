/**
 * Escapes special characters in strings to make them valid HTML IDs.
 * Currently replaces colons with dashes, but can be extended for other characters.
 * @param value - The string to be escaped.
 * @returns The escaped string that is safe to use as an HTML ID.
 */
export const escapeHtmlId = (value: string): string => {
  return value.replace(/:/gu, '-');
};
