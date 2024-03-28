import {
  getRpcPromiseCallback,
  isValidChainId
} from "./chunk-ZN7WV55J.mjs";
import {
  messages_default
} from "./chunk-ZGDQ3IYD.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-X66SUIEF.mjs";

// src/BaseProvider.ts
import { JsonRpcEngine } from "@metamask/json-rpc-engine";
import { rpcErrors, JsonRpcError } from "@metamask/rpc-errors";
import SafeEventEmitter from "@metamask/safe-event-emitter";
import dequal from "fast-deep-equal";
var _chainId, _selectedAddress;
var _BaseProvider = class _BaseProvider extends SafeEventEmitter {
  /**
   * Create a new instance of the provider.
   *
   * @param options - An options bag.
   * @param options.logger - The logging API to use. Default: `console`.
   * @param options.maxEventListeners - The maximum number of event
   * listeners. Default: 100.
   * @param options.rpcMiddleware - The RPC middleware stack. Default: [].
   */
  constructor({
    logger = console,
    maxEventListeners = 100,
    rpcMiddleware = []
  } = {}) {
    super();
    /**
     * The chain ID of the currently connected Ethereum chain.
     * See [chainId.network]{@link https://chainid.network} for more information.
     */
    __privateAdd(this, _chainId, void 0);
    /**
     * The user's currently selected Ethereum address.
     * If null, MetaMask is either locked or the user has not permitted any
     * addresses to be viewed.
     */
    __privateAdd(this, _selectedAddress, void 0);
    this._log = logger;
    this.setMaxListeners(maxEventListeners);
    this._state = {
      ..._BaseProvider._defaultState
    };
    __privateSet(this, _selectedAddress, null);
    __privateSet(this, _chainId, null);
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
    this._handleConnect = this._handleConnect.bind(this);
    this._handleChainChanged = this._handleChainChanged.bind(this);
    this._handleDisconnect = this._handleDisconnect.bind(this);
    this._handleUnlockStateChanged = this._handleUnlockStateChanged.bind(this);
    this._rpcRequest = this._rpcRequest.bind(this);
    this.request = this.request.bind(this);
    const rpcEngine = new JsonRpcEngine();
    rpcMiddleware.forEach((middleware) => rpcEngine.push(middleware));
    this._rpcEngine = rpcEngine;
  }
  //====================
  // Public Properties
  //====================
  get chainId() {
    return __privateGet(this, _chainId);
  }
  get selectedAddress() {
    return __privateGet(this, _selectedAddress);
  }
  //====================
  // Public Methods
  //====================
  /**
   * Returns whether the provider can process RPC requests.
   *
   * @returns Whether the provider can process RPC requests.
   */
  isConnected() {
    return this._state.isConnected;
  }
  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   *
   * @param args - The RPC request arguments.
   * @param args.method - The RPC method name.
   * @param args.params - The parameters for the RPC method.
   * @returns A Promise that resolves with the result of the RPC method,
   * or rejects if an error is encountered.
   */
  async request(args) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw rpcErrors.invalidRequest({
        message: messages_default.errors.invalidRequestArgs(),
        data: args
      });
    }
    const { method, params } = args;
    if (typeof method !== "string" || method.length === 0) {
      throw rpcErrors.invalidRequest({
        message: messages_default.errors.invalidRequestMethod(),
        data: args
      });
    }
    if (params !== void 0 && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
      throw rpcErrors.invalidRequest({
        message: messages_default.errors.invalidRequestParams(),
        data: args
      });
    }
    const payload = params === void 0 || params === null ? {
      method
    } : {
      method,
      params
    };
    return new Promise((resolve, reject) => {
      this._rpcRequest(payload, getRpcPromiseCallback(resolve, reject));
    });
  }
  //====================
  // Private Methods
  //====================
  /**
   * MUST be called by child classes.
   *
   * Sets initial state if provided and marks this provider as initialized.
   * Throws if called more than once.
   *
   * Permits the `networkVersion` field in the parameter object for
   * compatibility with child classes that use this value.
   *
   * @param initialState - The provider's initial state.
   * @param initialState.accounts - The user's accounts.
   * @param initialState.chainId - The chain ID.
   * @param initialState.isUnlocked - Whether the user has unlocked MetaMask.
   * @param initialState.networkVersion - The network version.
   * @fires BaseProvider#_initialized - If `initialState` is defined.
   * @fires BaseProvider#connect - If `initialState` is defined.
   */
  _initializeState(initialState) {
    if (this._state.initialized) {
      throw new Error("Provider already initialized.");
    }
    if (initialState) {
      const { accounts, chainId, isUnlocked, networkVersion } = initialState;
      this._handleConnect(chainId);
      this._handleChainChanged({ chainId, networkVersion });
      this._handleUnlockStateChanged({ accounts, isUnlocked });
      this._handleAccountsChanged(accounts);
    }
    this._state.initialized = true;
    this.emit("_initialized");
  }
  /**
   * Internal RPC method. Forwards requests to background via the RPC engine.
   * Also remap ids inbound and outbound.
   *
   * @param payload - The RPC request object.
   * @param callback - The consumer's callback.
   * @returns The result of the RPC request.
   */
  _rpcRequest(payload, callback) {
    let callbackWrapper = callback;
    if (!Array.isArray(payload)) {
      if (!payload.jsonrpc) {
        payload.jsonrpc = "2.0";
      }
      if (payload.method === "eth_accounts" || payload.method === "eth_requestAccounts") {
        callbackWrapper = (error, response) => {
          this._handleAccountsChanged(
            response.result ?? [],
            payload.method === "eth_accounts"
          );
          callback(error, response);
        };
      }
      return this._rpcEngine.handle(payload, callbackWrapper);
    }
    return this._rpcEngine.handle(payload, callbackWrapper);
  }
  /**
   * When the provider becomes connected, updates internal state and emits
   * required events. Idempotent.
   *
   * @param chainId - The ID of the newly connected chain.
   * @fires MetaMaskInpageProvider#connect
   */
  _handleConnect(chainId) {
    if (!this._state.isConnected) {
      this._state.isConnected = true;
      this.emit("connect", { chainId });
      this._log.debug(messages_default.info.connected(chainId));
    }
  }
  /**
   * When the provider becomes disconnected, updates internal state and emits
   * required events. Idempotent with respect to the isRecoverable parameter.
   *
   * Error codes per the CloseEvent status codes as required by EIP-1193:
   * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes.
   *
   * @param isRecoverable - Whether the disconnection is recoverable.
   * @param errorMessage - A custom error message.
   * @fires BaseProvider#disconnect - If the disconnection is not recoverable.
   */
  _handleDisconnect(isRecoverable, errorMessage) {
    if (this._state.isConnected || !this._state.isPermanentlyDisconnected && !isRecoverable) {
      this._state.isConnected = false;
      let error;
      if (isRecoverable) {
        error = new JsonRpcError(
          1013,
          // Try again later
          errorMessage ?? messages_default.errors.disconnected()
        );
        this._log.debug(error);
      } else {
        error = new JsonRpcError(
          1011,
          // Internal error
          errorMessage ?? messages_default.errors.permanentlyDisconnected()
        );
        this._log.error(error);
        __privateSet(this, _chainId, null);
        this._state.accounts = null;
        __privateSet(this, _selectedAddress, null);
        this._state.isUnlocked = false;
        this._state.isPermanentlyDisconnected = true;
      }
      this.emit("disconnect", error);
    }
  }
  /**
   * Upon receipt of a new `chainId`, emits the corresponding event and sets
   * and sets relevant public state. Does nothing if the given `chainId` is
   * equivalent to the existing value.
   *
   * Permits the `networkVersion` field in the parameter object for
   * compatibility with child classes that use this value.
   *
   * @fires BaseProvider#chainChanged
   * @param networkInfo - An object with network info.
   * @param networkInfo.chainId - The latest chain ID.
   */
  _handleChainChanged({
    chainId
  } = {}) {
    if (!isValidChainId(chainId)) {
      this._log.error(messages_default.errors.invalidNetworkParams(), { chainId });
      return;
    }
    this._handleConnect(chainId);
    if (chainId !== __privateGet(this, _chainId)) {
      __privateSet(this, _chainId, chainId);
      if (this._state.initialized) {
        this.emit("chainChanged", __privateGet(this, _chainId));
      }
    }
  }
  /**
   * Called when accounts may have changed. Diffs the new accounts value with
   * the current one, updates all state as necessary, and emits the
   * accountsChanged event.
   *
   * @param accounts - The new accounts value.
   * @param isEthAccounts - Whether the accounts value was returned by
   * a call to eth_accounts.
   */
  _handleAccountsChanged(accounts, isEthAccounts = false) {
    let _accounts = accounts;
    if (!Array.isArray(accounts)) {
      this._log.error(
        "MetaMask: Received invalid accounts parameter. Please report this bug.",
        accounts
      );
      _accounts = [];
    }
    for (const account of accounts) {
      if (typeof account !== "string") {
        this._log.error(
          "MetaMask: Received non-string account. Please report this bug.",
          accounts
        );
        _accounts = [];
        break;
      }
    }
    if (!dequal(this._state.accounts, _accounts)) {
      if (isEthAccounts && this._state.accounts !== null) {
        this._log.error(
          `MetaMask: 'eth_accounts' unexpectedly updated accounts. Please report this bug.`,
          _accounts
        );
      }
      this._state.accounts = _accounts;
      if (__privateGet(this, _selectedAddress) !== _accounts[0]) {
        __privateSet(this, _selectedAddress, _accounts[0] || null);
      }
      if (this._state.initialized) {
        const _nextAccounts = [..._accounts];
        this.emit("accountsChanged", _nextAccounts);
      }
    }
  }
  /**
   * Upon receipt of a new isUnlocked state, sets relevant public state.
   * Calls the accounts changed handler with the received accounts, or an empty
   * array.
   *
   * Does nothing if the received value is equal to the existing value.
   * There are no lock/unlock events.
   *
   * @param opts - Options bag.
   * @param opts.accounts - The exposed accounts, if any.
   * @param opts.isUnlocked - The latest isUnlocked value.
   */
  _handleUnlockStateChanged({
    accounts,
    isUnlocked
  } = {}) {
    if (typeof isUnlocked !== "boolean") {
      this._log.error(
        "MetaMask: Received invalid isUnlocked parameter. Please report this bug."
      );
      return;
    }
    if (isUnlocked !== this._state.isUnlocked) {
      this._state.isUnlocked = isUnlocked;
      this._handleAccountsChanged(accounts ?? []);
    }
  }
};
_chainId = new WeakMap();
_selectedAddress = new WeakMap();
_BaseProvider._defaultState = {
  accounts: null,
  isConnected: false,
  isUnlocked: false,
  initialized: false,
  isPermanentlyDisconnected: false
};
var BaseProvider = _BaseProvider;

export {
  BaseProvider
};
//# sourceMappingURL=chunk-OGPA5Q76.mjs.map