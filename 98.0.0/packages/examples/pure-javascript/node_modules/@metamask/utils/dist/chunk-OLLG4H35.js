"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk6ZDHSOUVjs = require('./chunk-6ZDHSOUV.js');


var _chunkQVEKZRZ2js = require('./chunk-QVEKZRZ2.js');

// src/json.ts




















var _superstruct = require('superstruct');
var object = (schema) => (
  // The type is slightly different from a regular object struct, because we
  // want to make properties with `undefined` in their type optional, but not
  // `undefined` itself. This means that we need a type cast.
  _superstruct.object.call(void 0, schema)
);
function hasOptional({ path, branch }) {
  const field = path[path.length - 1];
  return _chunkQVEKZRZ2js.hasProperty.call(void 0, branch[branch.length - 2], field);
}
function exactOptional(struct) {
  return new (0, _superstruct.Struct)({
    ...struct,
    type: `optional ${struct.type}`,
    validator: (value, context) => !hasOptional(context) || struct.validator(value, context),
    refiner: (value, context) => !hasOptional(context) || struct.refiner(value, context)
  });
}
var finiteNumber = () => _superstruct.define.call(void 0, "finite number", (value) => {
  return _superstruct.is.call(void 0, value, _superstruct.number.call(void 0, )) && Number.isFinite(value);
});
var UnsafeJsonStruct = _superstruct.union.call(void 0, [
  _superstruct.literal.call(void 0, null),
  _superstruct.boolean.call(void 0, ),
  finiteNumber(),
  _superstruct.string.call(void 0, ),
  _superstruct.array.call(void 0, _superstruct.lazy.call(void 0, () => UnsafeJsonStruct)),
  _superstruct.record.call(void 0, 
    _superstruct.string.call(void 0, ),
    _superstruct.lazy.call(void 0, () => UnsafeJsonStruct)
  )
]);
var JsonStruct = _superstruct.coerce.call(void 0, UnsafeJsonStruct, _superstruct.any.call(void 0, ), (value) => {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, value, UnsafeJsonStruct);
  return JSON.parse(
    JSON.stringify(value, (propKey, propValue) => {
      if (propKey === "__proto__" || propKey === "constructor") {
        return void 0;
      }
      return propValue;
    })
  );
});
function isValidJson(value) {
  try {
    getSafeJson(value);
    return true;
  } catch (e) {
    return false;
  }
}
function getSafeJson(value) {
  return _superstruct.create.call(void 0, value, JsonStruct);
}
function getJsonSize(value) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, value, JsonStruct, "Invalid JSON value");
  const json = JSON.stringify(value);
  return new TextEncoder().encode(json).byteLength;
}
var jsonrpc2 = "2.0";
var JsonRpcVersionStruct = _superstruct.literal.call(void 0, jsonrpc2);
var JsonRpcIdStruct = _superstruct.nullable.call(void 0, _superstruct.union.call(void 0, [_superstruct.number.call(void 0, ), _superstruct.string.call(void 0, )]));
var JsonRpcErrorStruct = object({
  code: _superstruct.integer.call(void 0, ),
  message: _superstruct.string.call(void 0, ),
  data: exactOptional(JsonStruct),
  stack: exactOptional(_superstruct.string.call(void 0, ))
});
var JsonRpcParamsStruct = _superstruct.union.call(void 0, [_superstruct.record.call(void 0, _superstruct.string.call(void 0, ), JsonStruct), _superstruct.array.call(void 0, JsonStruct)]);
var JsonRpcRequestStruct = object({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  method: _superstruct.string.call(void 0, ),
  params: exactOptional(JsonRpcParamsStruct)
});
var JsonRpcNotificationStruct = object({
  jsonrpc: JsonRpcVersionStruct,
  method: _superstruct.string.call(void 0, ),
  params: exactOptional(JsonRpcParamsStruct)
});
function isJsonRpcNotification(value) {
  return _superstruct.is.call(void 0, value, JsonRpcNotificationStruct);
}
function assertIsJsonRpcNotification(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcNotificationStruct,
    "Invalid JSON-RPC notification",
    ErrorWrapper
  );
}
function isJsonRpcRequest(value) {
  return _superstruct.is.call(void 0, value, JsonRpcRequestStruct);
}
function assertIsJsonRpcRequest(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcRequestStruct,
    "Invalid JSON-RPC request",
    ErrorWrapper
  );
}
var PendingJsonRpcResponseStruct = _superstruct.object.call(void 0, {
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  result: _superstruct.optional.call(void 0, _superstruct.unknown.call(void 0, )),
  error: _superstruct.optional.call(void 0, JsonRpcErrorStruct)
});
var JsonRpcSuccessStruct = object({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  result: JsonStruct
});
var JsonRpcFailureStruct = object({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  error: JsonRpcErrorStruct
});
var JsonRpcResponseStruct = _superstruct.union.call(void 0, [
  JsonRpcSuccessStruct,
  JsonRpcFailureStruct
]);
function isPendingJsonRpcResponse(response) {
  return _superstruct.is.call(void 0, response, PendingJsonRpcResponseStruct);
}
function assertIsPendingJsonRpcResponse(response, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    response,
    PendingJsonRpcResponseStruct,
    "Invalid pending JSON-RPC response",
    ErrorWrapper
  );
}
function isJsonRpcResponse(response) {
  return _superstruct.is.call(void 0, response, JsonRpcResponseStruct);
}
function assertIsJsonRpcResponse(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcResponseStruct,
    "Invalid JSON-RPC response",
    ErrorWrapper
  );
}
function isJsonRpcSuccess(value) {
  return _superstruct.is.call(void 0, value, JsonRpcSuccessStruct);
}
function assertIsJsonRpcSuccess(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcSuccessStruct,
    "Invalid JSON-RPC success response",
    ErrorWrapper
  );
}
function isJsonRpcFailure(value) {
  return _superstruct.is.call(void 0, value, JsonRpcFailureStruct);
}
function assertIsJsonRpcFailure(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcFailureStruct,
    "Invalid JSON-RPC failure response",
    ErrorWrapper
  );
}
function isJsonRpcError(value) {
  return _superstruct.is.call(void 0, value, JsonRpcErrorStruct);
}
function assertIsJsonRpcError(value, ErrorWrapper) {
  _chunk6ZDHSOUVjs.assertStruct.call(void 0, 
    value,
    JsonRpcErrorStruct,
    "Invalid JSON-RPC error",
    ErrorWrapper
  );
}
function getJsonRpcIdValidator(options) {
  const { permitEmptyString, permitFractions, permitNull } = {
    permitEmptyString: true,
    permitFractions: false,
    permitNull: true,
    ...options
  };
  const isValidJsonRpcId = (id) => {
    return Boolean(
      typeof id === "number" && (permitFractions || Number.isInteger(id)) || typeof id === "string" && (permitEmptyString || id.length > 0) || permitNull && id === null
    );
  };
  return isValidJsonRpcId;
}



































exports.object = object; exports.exactOptional = exactOptional; exports.UnsafeJsonStruct = UnsafeJsonStruct; exports.JsonStruct = JsonStruct; exports.isValidJson = isValidJson; exports.getSafeJson = getSafeJson; exports.getJsonSize = getJsonSize; exports.jsonrpc2 = jsonrpc2; exports.JsonRpcVersionStruct = JsonRpcVersionStruct; exports.JsonRpcIdStruct = JsonRpcIdStruct; exports.JsonRpcErrorStruct = JsonRpcErrorStruct; exports.JsonRpcParamsStruct = JsonRpcParamsStruct; exports.JsonRpcRequestStruct = JsonRpcRequestStruct; exports.JsonRpcNotificationStruct = JsonRpcNotificationStruct; exports.isJsonRpcNotification = isJsonRpcNotification; exports.assertIsJsonRpcNotification = assertIsJsonRpcNotification; exports.isJsonRpcRequest = isJsonRpcRequest; exports.assertIsJsonRpcRequest = assertIsJsonRpcRequest; exports.PendingJsonRpcResponseStruct = PendingJsonRpcResponseStruct; exports.JsonRpcSuccessStruct = JsonRpcSuccessStruct; exports.JsonRpcFailureStruct = JsonRpcFailureStruct; exports.JsonRpcResponseStruct = JsonRpcResponseStruct; exports.isPendingJsonRpcResponse = isPendingJsonRpcResponse; exports.assertIsPendingJsonRpcResponse = assertIsPendingJsonRpcResponse; exports.isJsonRpcResponse = isJsonRpcResponse; exports.assertIsJsonRpcResponse = assertIsJsonRpcResponse; exports.isJsonRpcSuccess = isJsonRpcSuccess; exports.assertIsJsonRpcSuccess = assertIsJsonRpcSuccess; exports.isJsonRpcFailure = isJsonRpcFailure; exports.assertIsJsonRpcFailure = assertIsJsonRpcFailure; exports.isJsonRpcError = isJsonRpcError; exports.assertIsJsonRpcError = assertIsJsonRpcError; exports.getJsonRpcIdValidator = getJsonRpcIdValidator;
//# sourceMappingURL=chunk-OLLG4H35.js.map