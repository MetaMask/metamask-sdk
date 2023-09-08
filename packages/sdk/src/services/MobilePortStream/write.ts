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
