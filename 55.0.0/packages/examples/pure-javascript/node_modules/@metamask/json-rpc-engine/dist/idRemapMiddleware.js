"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdRemapMiddleware = void 0;
const getUniqueId_1 = require("./getUniqueId");
/**
 * Returns a middleware function that overwrites the `id` property of each
 * request with an ID that is guaranteed to be unique, and restores the original
 * ID in a return handler.
 *
 * If used, should be the first middleware in the stack.
 *
 * @returns The ID remap middleware function.
 */
function createIdRemapMiddleware() {
    return (request, response, next, _end) => {
        const originalId = request.id;
        const newId = (0, getUniqueId_1.getUniqueId)();
        request.id = newId;
        response.id = newId;
        next((done) => {
            request.id = originalId;
            response.id = originalId;
            done();
        });
    };
}
exports.createIdRemapMiddleware = createIdRemapMiddleware;
//# sourceMappingURL=idRemapMiddleware.js.map