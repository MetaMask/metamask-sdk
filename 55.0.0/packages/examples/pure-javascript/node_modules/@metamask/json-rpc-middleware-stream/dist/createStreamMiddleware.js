"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const safe_event_emitter_1 = __importDefault(require("@metamask/safe-event-emitter"));
const readable_stream_1 = require("readable-stream");
/**
 * Creates a JsonRpcEngine middleware with an associated Duplex stream and
 * EventEmitter. The middleware, and by extension stream, assume that middleware
 * parameters are properly formatted. No runtime type checking or validation is
 * performed.
 *
 * @param options - Configuration options for middleware.
 * @returns The event emitter, middleware, and stream.
 */
function createStreamMiddleware(options = {}) {
    const idMap = {}; // TODO: replace with actual Map
    const stream = new readable_stream_1.Duplex({
        objectMode: true,
        read: () => undefined,
        write: processMessage,
    });
    const events = new safe_event_emitter_1.default();
    const middleware = (req, res, next, end) => {
        // register request on id map *before* sending it to the stream, to avoid race issues
        idMap[req.id] = { req, res, next, end };
        // write req to stream
        sendToStream(req);
    };
    return { events, middleware, stream };
    /**
     * Forwards JSON-RPC request to the stream.
     *
     * @param req - The JSON-RPC request object.
     */
    function sendToStream(req) {
        // TODO: limiting retries could be implemented here
        stream.push(req);
    }
    /**
     * Writes a JSON-RPC object to the stream.
     *
     * @param res - The JSON-RPC response object.
     * @param _encoding - The stream encoding, not used.
     * @param streamWriteCallback - The stream write callback.
     */
    function processMessage(res, _encoding, streamWriteCallback) {
        let errorObj = null;
        try {
            const isNotification = !res.id;
            if (isNotification) {
                processNotification(res);
            }
            else {
                processResponse(res);
            }
        }
        catch (_err) {
            errorObj = _err;
        }
        // continue processing stream
        streamWriteCallback(errorObj);
    }
    /**
     * Processes a JSON-RPC response.
     *
     * @param res - The response to process.
     */
    function processResponse(res) {
        const { id: responseId } = res;
        if (responseId === null) {
            return;
        }
        const context = idMap[responseId];
        if (!context) {
            console.warn(`StreamMiddleware - Unknown response id "${responseId}"`);
            return;
        }
        delete idMap[responseId];
        // copy whole res onto original res
        Object.assign(context.res, res);
        // run callback on empty stack,
        // prevent internal stream-handler from catching errors
        // TODO: remove eslint-disable once issue #1989 is resolved.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        setTimeout(context.end);
    }
    /**
     * Processes a JSON-RPC notification.
     *
     * @param notif - The notification to process.
     */
    function processNotification(notif) {
        if ((options === null || options === void 0 ? void 0 : options.retryOnMessage) && notif.method === options.retryOnMessage) {
            retryStuckRequests();
        }
        events.emit('notification', notif);
    }
    /**
     * Retry pending requests.
     */
    function retryStuckRequests() {
        Object.values(idMap).forEach(({ req, retryCount = 0 }) => {
            // Avoid retrying requests without an id - they cannot have matching responses so retry logic doesn't apply
            // Check for retry count below ensure that a request is not retried more than 3 times
            if (!req.id) {
                return;
            }
            if (retryCount >= 3) {
                throw new Error(`StreamMiddleware - Retry limit exceeded for request id "${req.id}"`);
            }
            const idMapObject = idMap[req.id];
            if (idMapObject) {
                idMapObject.retryCount = retryCount + 1;
            }
            sendToStream(req);
        });
    }
}
exports.default = createStreamMiddleware;
//# sourceMappingURL=createStreamMiddleware.js.map