import debug from 'debug';

import type { StoreClient } from '../store/client';

/**
 * Supported debug namespace types for the MetaMask SDK logger.
 * These namespaces help categorize and filter debug output.
 */
export type LoggerNameSpaces =
  | 'metamask-sdk'
  | 'metamask-sdk:core'
  | 'metamask-sdk:provider';

/**
 * Creates a debug logger instance with the specified namespace and color.
 *
 * This function initializes a debug logger using the 'debug' library,
 * which allows for conditional logging based on environment variables or storage settings.
 *
 * @param namespace - The debug namespace to use for this logger instance
 * @param color - The ANSI color code to use for log output (default: '214' for yellow)
 * @returns A configured debug logger instance
 */
export const createLogger = (
  namespace: LoggerNameSpaces = 'metamask-sdk',
  color = '214',
) => {
  debug.disable();
  const logger = debug(namespace);
  logger.color = color; // Yellow color (basic ANSI)
  return logger;
};

/**
 * Enables debug logging for the specified namespace.
 *
 * This function activates debug output for the given namespace,
 * allowing debug messages to be displayed in the console.
 *
 * @param namespace - The debug namespace to enable
 */
export const enableDebug = (namespace: LoggerNameSpaces = 'metamask-sdk') => {
  debug.enable(namespace);
};

/**
 * Checks if a specific namespace is enabled in the given debug value string.
 *
 * This function determines whether debug logging should be active for a namespace
 * by checking if the debug value contains the namespace, a wildcard pattern, or
 * the general MetaMask SDK wildcard.
 *
 * @param debugValue - The debug configuration string (e.g., from environment or storage)
 * @param namespace - The namespace to check for enablement
 * @returns True if the namespace should have debug logging enabled, false otherwise
 */
function isNamespaceEnabled(debugValue: string, namespace: LoggerNameSpaces) {
  return (
    debugValue.includes(namespace) ||
    debugValue.includes('metamask-sdk:*') ||
    debugValue.includes('*')
  );
}

/**
 * Determines if debug logging is enabled for a specific namespace.
 *
 * This function checks multiple sources to determine if debug logging should be active:
 * 1. First checks the process environment variable 'debug'
 * 2. Falls back to checking the debug setting in storage
 * 3. Returns false if neither source enables the namespace
 *
 * @param namespace - The namespace to check for debug enablement
 * @param storage - The storage client to check for debug settings
 * @returns Promise that resolves to true if debug logging is enabled, false otherwise
 */
export const isEnabled = async (
  namespace: LoggerNameSpaces,
  storage: StoreClient,
) => {
  if (process?.env?.debug) {
    const {debug} = process.env
    return isNamespaceEnabled(debug, namespace);
  }

  const storageDebug = await storage.getDebug();
  if (storageDebug) {
    return isNamespaceEnabled(storageDebug, namespace);
  }

  return false;
};
