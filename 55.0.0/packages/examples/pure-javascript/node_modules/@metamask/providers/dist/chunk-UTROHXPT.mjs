import {
  BaseProvider
} from "./chunk-OGPA5Q76.mjs";
import {
  EMITTED_NOTIFICATIONS,
  isValidChainId,
  isValidNetworkVersion
} from "./chunk-ZN7WV55J.mjs";
import {
  messages_default
} from "./chunk-ZGDQ3IYD.mjs";

// src/StreamProvider.ts
import { createStreamMiddleware } from "@metamask/json-rpc-middleware-stream";
import ObjectMultiplex from "@metamask/object-multiplex";
import { duplex as isDuplex } from "is-stream";
import { pipeline } from "readable-stream";
var AbstractStreamProvider = class extends BaseProvider {
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
    if (!isDuplex(connectionStream)) {
      throw new Error(messages_default.errors.invalidDuplexStream());
    }
    this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this);
    const mux = new ObjectMultiplex();
    pipeline(
      connectionStream,
      mux,
      connectionStream,
      this._handleStreamDisconnect.bind(this, "MetaMask")
    );
    this._jsonRpcConnection = createStreamMiddleware({
      retryOnMessage: "METAMASK_EXTENSION_CONNECT_CAN_RETRY"
    });
    pipeline(
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
      } else if (EMITTED_NOTIFICATIONS.includes(method)) {
        this.emit("message", {
          type: method,
          data: params
        });
      } else if (method === "METAMASK_STREAM_FAILURE") {
        connectionStream.destroy(
          new Error(messages_default.errors.permanentlyDisconnected())
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
    if (error?.stack) {
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
    if (!isValidChainId(chainId) || !isValidNetworkVersion(networkVersion)) {
      this._log.error(messages_default.errors.invalidNetworkParams(), {
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

export {
  AbstractStreamProvider,
  StreamProvider
};
//# sourceMappingURL=chunk-UTROHXPT.mjs.map