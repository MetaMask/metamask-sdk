"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readable_stream_1 = require("readable-stream");
/**
 * Takes a JsonRpcEngine and returns a Duplex stream wrapping it.
 *
 * @param opts - Options bag.
 * @param opts.engine - The JsonRpcEngine to wrap in a stream.
 * @returns The stream wrapping the engine.
 */
function createEngineStream(opts) {
    if (!(opts === null || opts === void 0 ? void 0 : opts.engine)) {
        throw new Error('Missing engine parameter!');
    }
    const { engine } = opts;
    const stream = new readable_stream_1.Duplex({ objectMode: true, read: () => undefined, write });
    // forward notifications
    if (engine.on) {
        engine.on('notification', (message) => {
            stream.push(message);
        });
    }
    return stream;
    /**
     * Write a JSON-RPC request to the stream.
     *
     * @param req - The JSON-rpc request.
     * @param _encoding - The stream encoding, not used.
     * @param streamWriteCallback - The stream write callback.
     */
    function write(req, _encoding, streamWriteCallback) {
        engine.handle(req, (_err, res) => {
            stream.push(res);
        });
        streamWriteCallback();
    }
}
exports.default = createEngineStream;
//# sourceMappingURL=createEngineStream.js.map