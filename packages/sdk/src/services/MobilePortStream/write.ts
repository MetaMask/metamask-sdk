import { Buffer } from 'buffer';
import { MAX_MESSAGE_LENGTH } from '../../config';

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
    let stringifiedData: string;
    if (Buffer.isBuffer(chunk)) {
      const data: {
        type: 'Buffer';
        data: number[];
        _isBuffer?: boolean;
      } = chunk.toJSON();

      data._isBuffer = true;
      stringifiedData = JSON.stringify({ ...data, origin: window.location.href });
    } else {
      if (chunk.data) {
        chunk.data.toNative = true;
      }

      stringifiedData = JSON.stringify({ ...chunk, origin: window.location.href });
    }

    if (stringifiedData.length > MAX_MESSAGE_LENGTH) {
      return cb(new Error(`Message size ${stringifiedData.length} exceeds maximum allowed size of ${MAX_MESSAGE_LENGTH} bytes`));
    }

    window.ReactNativeWebView?.postMessage(stringifiedData);
  } catch (err) {
    return cb(new Error('MobilePortStream - disconnected'));
  }
  return cb();
}
