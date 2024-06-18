import debug from 'debug';

/**
 * Logger for the SDK.
 * This logger uses the 'debug' library for outputting debug information.
 * Logging is enabled in the code via `debug.enable('__NAMESPACE__')`.
 */
export const logger = debug('MM_SDK');

logger.color = '#FFAC1C';
