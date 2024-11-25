import { Buffer } from 'buffer';

/**
 * Handles communication between the in-app browser and MetaMask mobile application.
 * This function processes and forwards messages through the ReactNativeWebView bridge,
 * supporting both Buffer and regular message formats.
 *
 * @param chunk - The data to be written (either Buffer or message object)
 * @param _encoding - Buffer encoding (unused but required by stream interface)
 * @param cb - Callback function to handle completion or errors
 */
export function write(
  chunk: any,
  _encoding: BufferEncoding,
  cb: (error?: Error | null) => void,
) {
  try {
    if (Buffer.isBuffer(chunk)) {
      const data: {
        type: 'Buffer';
        data: number[];
        _isBuffer?: boolean;
      } = chunk.toJSON();

      data._isBuffer = true;
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ ...data, origin: window.location.href }),
      );
    } else {
      if (chunk.data) {
        chunk.data.toNative = true;
      }

      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ ...chunk, origin: window.location.href }),
      );
    }
  } catch (err) {
    return cb(new Error('MobilePortStream - disconnected'));
  }
  return cb();
}
