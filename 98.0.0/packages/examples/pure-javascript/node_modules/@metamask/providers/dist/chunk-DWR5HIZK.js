"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkA3W22U42js = require('./chunk-A3W22U42.js');




var _chunkO5ECOCX2js = require('./chunk-O5ECOCX2.js');


var _chunk4EQNSGSRjs = require('./chunk-4EQNSGSR.js');

// src/StreamProvider.ts
var _jsonrpcmiddlewarestream = require('@metamask/json-rpc-middleware-stream');
var _objectmultiplex = require('@metamask/object-multiplex'); var _objectmultiplex2 = _interopRequireDefault(_objectmultiplex);
var _isstream = require('is-stream');
var _readablestream = require('readable-stream');
var AbstractStreamProvider = class extends _chunkA3W22U42js.BaseProvider {
  /**
   * Creates a new AbstractStreamProvider instance.
   *
   * @param connectionStream - A Node.js duplex stream.
   * @param options - An options bag.
   * @param options.jsonRpcStreamName - The name of the internal JSON-RPC stream.
   * @param options.logger - The logging API to use. Default: `console`.
   * @param options.maxEventListeners - The maximum number of event
   * listeners. Default: 100.
   * @param options.rpcMiddleware - The RPC middleware stack to use.
   */
  constructor(connectionStream, {
    jsonRpcStreamName,
    logger = console,
    maxEventListeners = 100,
    rpcMiddleware = []
  }) {
    super({ logger, maxEventListeners, rpcMiddleware });
    if (!_isstream.duplex.call(void 0, connectionStream)) {
      throw new Error(_chunk4EQNSGSRjs.messages_default.errors.invalidDuplexStream());
    }
    this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this);
    const mux = new (0, _objectmultiplex2.default)();
    _readablestream.pipeline.call(void 0, 
      connectionStream,
      mux,
      connectionStream,
      this._handleStreamDisconnect.bind(this, "MetaMask")
    );
    this._jsonRpcConnection = _jsonrpcmiddlewarestream.createStreamMiddleware.call(void 0, {
      retryOnMessage: "METAMASK_EXTENSION_CONNECT_CAN_RETRY"
    });
    _readablestream.pipeline.call(void 0, 
      this._jsonRpcConnection.stream,
      mux.createStream(jsonRpcStreamName),
      this._jsonRpcConnection.stream,
      this._handleStreamDisconnect.bind(this, "MetaMask RpcProvider")
    );
    this._rpcEngine.push(this._jsonRpcConnection.middleware);
    this._jsonRpcConnection.events.on("notification", (payload) => {
      const { method, params } = payload;
      if (method === "metamask_accountsChanged") {
        this._handleAccountsChanged(params);
      } else if (method === "metamask_unlockStateChanged") {
        this._handleUnlockStateChanged(params);
      } else if (method === "metamask_chainChanged") {
        this._handleChainChanged(params);
      } else if (_chunkO5ECOCX2js.EMITTED_NOTIFICATIONS.includes(method)) {
        this.emit("message", {
          type: method,
          data: params
        });
      } else if (method === "METAMASK_STREAM_FAILURE") {
        connectionStream.destroy(
          new Error(_chunk4EQNSGSRjs.messages_default.errors.permanentlyDisconnected())
        );
      }
    });
  }
  //====================
  // Private Methods
  //====================
  /**
   * MUST be called by child classes.
   *
   * Calls `metamask_getProviderState` and passes the result to
   * {@link BaseProvider._initializeState}. Logs an error if getting initial state
   * fails. Throws if called after initialization has completed.
   */
  async _initializeStateAsync() {
    let initialState;
    try {
      initialState = await this.request({
        method: "metamask_getProviderState"
      });
    } catch (error) {
      this._log.error(
        "MetaMask: Failed to get initial state. Please report this bug.",
        error
      );
    }
    this._initializeState(initialState);
  }
  /**
   * Called when connection is lost to critical streams. Emits an 'error' event
   * from the provider with the error message and stack if present.
   *
   * @param streamName - The name of the stream that disconnected.
   * @param error - The error that caused the disconnection.
   * @fires BaseProvider#disconnect - If the provider is not already
   * disconnected.
   */
  // eslint-disable-next-line no-restricted-syntax
  _handleStreamDisconnect(streamName, error) {
    let warningMsg = `MetaMask: Lost connection to "${streamName}".`;
    if (_optionalChain([error, 'optionalAccess', _ => _.stack])) {
      warningMsg += `
${error.stack}`;
    }
    this._log.warn(warningMsg);
    if (this.listenerCount("error") > 0) {
      this.emit("error", warningMsg);
    }
    this._handleDisconnect(false, error ? error.message : void 0);
  }
  /**
   * Upon receipt of a new chainId and networkVersion, emits corresponding
   * events and sets relevant public state. This class does not have a
   * `networkVersion` property, but we rely on receiving a `networkVersion`
   * with the value of `loading` to detect when the network is changing and
   * a recoverable `disconnect` even has occurred. Child classes that use the
   * `networkVersion` for other purposes must implement additional handling
   * therefore.
   *
   * @fires BaseProvider#chainChanged
   * @param networkInfo - An object with network info.
   * @param networkInfo.chainId - The latest chain ID.
   * @param networkInfo.networkVersion - The latest network ID.
   */
  _handleChainChanged({
    chainId,
    networkVersion
  } = {}) {
    if (!_chunkO5ECOCX2js.isValidChainId.call(void 0, chainId) || !_chunkO5ECOCX2js.isValidNetworkVersion.call(void 0, networkVersion)) {
      this._log.error(_chunk4EQNSGSRjs.messages_default.errors.invalidNetworkParams(), {
        chainId,
        networkVersion
      });
      return;
    }
    if (networkVersion === "loading") {
      this._handleDisconnect(true);
    } else {
      super._handleChainChanged({ chainId });
    }
  }
};
var StreamProvider = class extends AbstractStreamProvider {
  /**
   * MUST be called after instantiation to complete initialization.
   *
   * Calls `metamask_getProviderState` and passes the result to
   * {@link BaseProvider._initializeState}. Logs an error if getting initial state
   * fails. Throws if called after initialization has completed.
   */
  async initialize() {
    return this._initializeStateAsync();
  }
};




exports.AbstractStreamProvider = AbstractStreamProvider; exports.StreamProvider = StreamProvider;
//# sourceMappingURL=chunk-DWR5HIZK.js.map