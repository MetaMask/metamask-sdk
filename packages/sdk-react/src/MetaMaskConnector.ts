import { EventType, MetaMaskSDK, SDKProvider } from '@metamask/sdk';
import {
  InjectedConnector,
  InjectedConnectorOptions,
  WindowProvider,
} from '@wagmi/core';
import {
  Address,
  Chain,
  ProviderRpcError,
  ResourceUnavailableRpcError,
  UserRejectedRequestError,
} from 'viem';

export type MetaMaskConnectorOptions = Pick<
  InjectedConnectorOptions,
  'shimDisconnect'
> & {
  /**
   * While "disconnected" with `shimDisconnect`, allows user to select a different MetaMask account (than the currently connected account) when trying to connect.
   */
  // eslint-disable-next-line camelcase
  UNSTABLE_shimOnConnectSelectAccount?: boolean;
  sdk?: MetaMaskSDK;
};

class MetaMaskConnector extends InjectedConnector {
  readonly id = 'metaMask';

  protected shimDisconnectKey = `${this.id}.shimDisconnect`;

  #sdk: MetaMaskSDK;

  #provider?: SDKProvider;

  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[];
    options?: MetaMaskConnectorOptions;
  } = {}) {
    if (!options_?.sdk) {
      throw new Error('MetaMaskConnector requires MetaMaskSDK');
    }
    const { sdk } = options_;
    const sdkProvider = sdk.getProvider();

    const options = {
      name: 'MetaMask',
      shimDisconnect: true,
      getProvider() {
        // ignore _events from WindowProvider not implemented in SDKProvider
        return sdkProvider as unknown as WindowProvider;
      },
    };

    console.debug(`initialize MetaMaskConnector`, options_);
    super({ chains, options });

    this.#sdk = sdk;
    this.#provider = sdkProvider;
    // Listen to sdk provider events and re-initialize events listeners accordingly
    this.#sdk.on(
      EventType.PROVIDER_UPDATE,
      this.onSDKProviderUpdate.bind(this),
    );
  }

  private onSDKProviderUpdate(accounts: Address[]) {
    console.debug(
      `onSDKProviderUpdate listeners=${this.#provider?.listenerCount(
        EventType.PROVIDER_UPDATE,
      )}`,
      accounts,
    );

    if (this.#provider) {
      // Cleanup previous handlers first
      this.#provider?.removeListener(
        'accountsChanged',
        this.onAccountsChanged as any,
      );
      this.#provider?.removeListener(
        'chainChanged',
        this.onChainChanged as any,
      );
      this.#provider?.removeListener('disconnect', this.onDisconnect as any);
    }

    // might need to re-initialize provider if it changed
    this.#provider = this.#sdk.getProvider();

    this.#provider?.on('accountsChanged', this.onAccountsChanged as any);
    this.#provider?.on('chainChanged', this.onChainChanged as any);
    this.#provider?.on('disconnect', this.onDisconnect as any);
  }

  async getProvider() {
    if (!this.#sdk.isInitialized()) {
      await this.#sdk.init();
    }
    if (!this.#provider) {
      this.#provider = this.#sdk.getProvider();
    }
    return this.#provider as unknown as WindowProvider;
  }

  async disconnect() {
    this.#sdk.terminate();
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<{
    account: Address;
    chain: {
      id: number;
      unsupported: boolean;
    };
    provider: any;
  }> {
    try {
      if (!this.#sdk.isInitialized()) {
        await this.#sdk.init();
      }

      this.#provider = this.#sdk.getProvider();

      // check if previouslt disconnected -- if shims is removed it means disconnected
      const shimDisconnect = this.storage?.getItem(this.shimDisconnectKey);
      if (shimDisconnect) {
        console.debug(`shims is not in storage --- should be connected`);
      } else {
        console.debug(`should be disconnected`);
      }

      const accounts = (await this.#provider?.request({
        method: 'eth_requestAccounts',
        params: [],
      })) as Address[];
      console.debug(`connect accounts`, accounts);

      const selectedAccount: Address = accounts?.[0] ?? '0x';

      console.warn(
        `TEST authorization ${Date.now()} authorized=${this.#sdk
          ._getConnection()
          ?.isAuthorized()}}`,
      );

      // backward compatibility with older wallet version that return accounts before authorization
      if (!this.#sdk._getConnection()?.isAuthorized()) {
        const waitForAuthorized = () => {
          return new Promise((resolve) => {
            this.#sdk
              ._getConnection()
              ?.getConnector()
              .once(EventType.AUTHORIZED, () => {
                console.debug(`received auhtorized event`);
                resolve(true);
              });
          });
        };
        await waitForAuthorized();
      }

      console.debug(`provider`, this.#provider);
      let providerChainId: string | null | undefined = this.#provider?.chainId;
      if (!providerChainId) {
        // request chainId from provider
        console.debug(`request chainId from provider`);
        try {
          providerChainId = (await this.#provider?.request({
            method: 'eth_chainId',
            params: [],
          })) as string;
          console.debug(`provider chainId=${providerChainId}`);
        } catch (error) {
          console.debug(`provider chainId error`, error);
          // use default mainnet provider
          providerChainId = '0x1';
        }
      }

      console.debug(`provider chainId=${providerChainId}`);
      const chain = {
        id: parseInt(providerChainId, 16),
        unsupported: false,
      };

      console.debug(
        `checking chain chainId=${chainId} vs chain.id=${chain.id}`,
      );
      if (chainId !== undefined && chain.id !== chainId) {
        const newChain = await this.switchChain(chainId);
        const unsupported = this.isChainUnsupported(newChain.id);
        chain.id = newChain.id;
        chain.unsupported = unsupported;
      }

      // this.emit('connect', {})
      // this.#provider?.emit('accountsChanged', [selectedAccount]);

      if (this.options?.shimDisconnect) {
        this.storage?.setItem(this.shimDisconnectKey, true);
      }

      const connectResponse = {
        isConnected: true,
        account: selectedAccount,
        chain,
        provider: this.#provider,
      };

      return connectResponse;
    } catch (error) {
      if (this.isUserRejectedRequestError(error)) {
        throw new UserRejectedRequestError(error as Error);
      } else if ((error as ProviderRpcError).code === -32002) {
        throw new ResourceUnavailableRpcError(error as ProviderRpcError);
      }
      throw error;
    }
  }

  getSDK() {
    return this.#sdk;
  }
}

export default MetaMaskConnector;
