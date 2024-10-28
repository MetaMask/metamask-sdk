import {
  assertStruct
} from "./chunk-74DGVJVE.mjs";
import {
  hasProperty
} from "./chunk-H4YFDLB7.mjs";

// src/json.ts
import {
  any,
  array,
  boolean,
  coerce,
  create,
  define,
  integer,
  is,
  lazy,
  literal,
  nullable,
  number,
  object as superstructObject,
  optional,
  record,
  string,
  union,
  unknown,
  Struct
} from "superstruct";
var object = (schema) => (
  // The type is slightly different from a regular object struct, because we
  // want to make properties with `undefined` in their type optional, but not
  // `undefined` itself. This means that we need a type cast.
  superstructObject(schema)
);
function hasOptional({ path, branch }) {
  const field = path[path.length - 1];
  return hasProperty(branch[branch.length - 2], field);
}
function exactOptional(struct) {
  return new Struct({
    ...struct,
    type: `optional ${struct.type}`,
    validator: (value, context) => !hasOptional(context) || struct.validator(value, context),
    refiner: (value, context) => !hasOptional(context) || struct.refiner(value, context)
  });
}
var finiteNumber = () => define("finite number", (value) => {
  return is(value, number()) && Number.isFinite(value);
});
var UnsafeJsonStruct = union([
  literal(null),
  boolean(),
  finiteNumber(),
  string(),
  array(lazy(() => UnsafeJsonStruct)),
  record(
    string(),
    lazy(() => UnsafeJsonStruct)
  )
]);
var JsonStruct = coerce(UnsafeJsonStruct, any(), (value) => {
  assertStruct(value, UnsafeJsonStruct);
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
  } catch {
    return false;
  }
}
function getSafeJson(value) {
  return create(value, JsonStruct);
}
function getJsonSize(value) {
  assertStruct(value, JsonStruct, "Invalid JSON value");
  const json = JSON.stringify(value);
  return new TextEncoder().encode(json).byteLength;
}
var jsonrpc2 = "2.0";
var JsonRpcVersionStruct = literal(jsonrpc2);
var JsonRpcIdStruct = nullable(union([number(), string()]));
var JsonRpcErrorStruct = object({
  code: integer(),
  message: string(),
  data: exactOptional(JsonStruct),
  stack: exactOptional(string())
});
var JsonRpcParamsStruct = union([record(string(), JsonStruct), array(JsonStruct)]);
var JsonRpcRequestStruct = object({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  method: string(),
  params: exactOptional(JsonRpcParamsStruct)
});
var JsonRpcNotificationStruct = object({
  jsonrpc: JsonRpcVersionStruct,
  method: string(),
  params: exactOptional(JsonRpcParamsStruct)
});
function isJsonRpcNotification(value) {
  return is(value, JsonRpcNotificationStruct);
}
function assertIsJsonRpcNotification(value, ErrorWrapper) {
  assertStruct(
    value,
    JsonRpcNotificationStruct,
    "Invalid JSON-RPC notification",
    ErrorWrapper
  );
}
function isJsonRpcRequest(value) {
  return is(value, JsonRpcRequestStruct);
}
function assertIsJsonRpcRequest(value, ErrorWrapper) {
  assertStruct(
    value,
    JsonRpcRequestStruct,
    "Invalid JSON-RPC request",
    ErrorWrapper
  );
}
var PendingJsonRpcResponseStruct = superstructObject({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  result: optional(unknown()),
  error: optional(JsonRpcErrorStruct)
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
var JsonRpcResponseStruct = union([
  JsonRpcSuccessStruct,
  JsonRpcFailureStruct
]);
function isPendingJsonRpcResponse(response) {
  return is(response, PendingJsonRpcResponseStruct);
}
function assertIsPendingJsonRpcResponse(response, ErrorWrapper) {
  assertStruct(
    response,
    PendingJsonRpcResponseStruct,
    "Invalid pending JSON-RPC response",
    ErrorWrapper
  );
}
function isJsonRpcResponse(response) {
  return is(response, JsonRpcResponseStruct);
}
function assertIsJsonRpcResponse(value, ErrorWrapper) {
  assertStruct(
    value,
    JsonRpcResponseStruct,
    "Invalid JSON-RPC response",
    ErrorWrapper
  );
}
function isJsonRpcSuccess(value) {
  return is(value, JsonRpcSuccessStruct);
}
function assertIsJsonRpcSuccess(value, ErrorWrapper) {
  assertStruct(
    value,
    JsonRpcSuccessStruct,
    "Invalid JSON-RPC success response",
    ErrorWrapper
  );
}
function isJsonRpcFailure(value) {
  return is(value, JsonRpcFailureStruct);
}
function assertIsJsonRpcFailure(value, ErrorWrapper) {
  assertStruct(
    value,
    JsonRpcFailureStruct,
    "Invalid JSON-RPC failure response",
    ErrorWrapper
  );
}
function isJsonRpcError(value) {
  return is(value, JsonRpcErrorStruct);
}
function assertIsJsonRpcError(value, ErrorWrapper) {
  assertStruct(
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

export {
  object,
  exactOptional,
  UnsafeJsonStruct,
  JsonStruct,
  isValidJson,
  getSafeJson,
  getJsonSize,
  jsonrpc2,
  JsonRpcVersionStruct,
  JsonRpcIdStruct,
  JsonRpcErrorStruct,
  JsonRpcParamsStruct,
  JsonRpcRequestStruct,
  JsonRpcNotificationStruct,
  isJsonRpcNotification,
  assertIsJsonRpcNotification,
  isJsonRpcRequest,
  assertIsJsonRpcRequest,
  PendingJsonRpcResponseStruct,
  JsonRpcSuccessStruct,
  JsonRpcFailureStruct,
  JsonRpcResponseStruct,
  isPendingJsonRpcResponse,
  assertIsPendingJsonRpcResponse,
  isJsonRpcResponse,
  assertIsJsonRpcResponse,
  isJsonRpcSuccess,
  assertIsJsonRpcSuccess,
  isJsonRpcFailure,
  assertIsJsonRpcFailure,
  isJsonRpcError,
  assertIsJsonRpcError,
  getJsonRpcIdValidator
};
//# sourceMappingURL=chunk-6C35XQOF.mjs.map