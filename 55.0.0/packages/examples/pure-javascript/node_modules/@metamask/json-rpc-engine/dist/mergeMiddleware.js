"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMiddleware = void 0;
const JsonRpcEngine_1 = require("./JsonRpcEngine");
/**
 * Takes a stack of middleware and joins them into a single middleware function.
 *
 * @param middlewareStack - The middleware stack to merge.
 * @returns The merged middleware function.
 */
function mergeMiddleware(middlewareStack) {
    const engine = new JsonRpcEngine_1.JsonRpcEngine();
    middlewareStack.forEach((middleware) => engine.push(middleware));
    return engine.asMiddleware();
}
exports.mergeMiddleware = mergeMiddleware;
//# sourceMappingURL=mergeMiddleware.js.map