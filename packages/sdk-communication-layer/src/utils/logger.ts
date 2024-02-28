import debug from 'debug';

/**
 * Logger for the Key Exchange Layer.
 * Utilizes the 'debug' library to output debug information for the key exchange process.
 */
export const loggerKeyExchangeLayer = debug('KeyExchange:Layer');

/**
 * Logger for the SocketService Layer, specifically for socket communication.
 * Utilizes the 'debug' library to output debug information for socket services.
 */
export const loggerServiceLayer = debug('SocketService:Layer');

/**
 * Logger for the Elliptic Curve Integrated Encryption Scheme (ECIES) Layer.
 * Utilizes the 'debug' library to output debug information for ECIES operations.
 */
export const loggerEciesLayer = debug('Ecies:Layer');

/**
 * Logger for the RemoteCommunication Layer.
 * Utilizes the 'debug' library to output debug information for remote communication.
 */
export const loggerRemoteLayer = debug('RemoteCommunication:Layer');

loggerKeyExchangeLayer.color = '##95c44e';
loggerServiceLayer.color = '#f638d7';
loggerEciesLayer.color = '#465b9c';
loggerRemoteLayer.color = '#47a2be';
