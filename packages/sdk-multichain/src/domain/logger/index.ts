import debug from 'debug';
import type { StoreClient } from '../store/client';

type LoggerNameSpaces =
  | 'metamask-sdk'
  | 'metamask-sdk:core'
  | 'metamask-sdk:provider';

export const createLogger = (
  namespace: LoggerNameSpaces = 'metamask-sdk',
  color = '214'
) => {
  debug.disable();
  const logger = debug(namespace);
  logger.color = color; // Yellow color (basic ANSI)
  return logger;
}

export const enableDebug = (namespace: LoggerNameSpaces = 'metamask-sdk') => {
  debug.enable(namespace);
}

function isNamespaceEnabled(debugValue: string, namespace: LoggerNameSpaces) {
  return debugValue.includes(namespace) || debugValue.includes('metamask-sdk:*') || debugValue.includes('*')
}

export const isEnabled = async (namespace: LoggerNameSpaces, storage: StoreClient) => {

  if (process?.env?.debug) {
    const debug = process.env.debug
    return isNamespaceEnabled(debug, namespace)
  }

  const storageDebug = await storage.getDebug();
  if (storageDebug) {
    return isNamespaceEnabled(storageDebug, namespace)
  }

  return false
}