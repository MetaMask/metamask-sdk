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
  debug?: boolean;
  sdk: MetaMaskSDK;
};

class MetaMaskConnector extends InjectedConnector {
  readonly id = 'metaMask';

  protected shimDisconnectKey = `${this.id}.shimDisconnect`;

  #sdk: MetaMaskSDK;

  #debug = false;

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

    super({ chains, options });

    if(options_?.debug) {
      this.#debug = options_.debug;
    }
    this.#sdk = sdk;
    this.#provider = sdkProvider;
    // Listen to sdk provider events and re-initialize events listeners accordingly
    this.#sdk.on(
      EventType.PROVIDER_UPDATE,
      this.onSDKProviderUpdate.bind(this),
    );
  }

  private onSDKProviderUpdate(_accounts: Address[]) {
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
      // TODO see if we need to keep/use shimDisconnect
      // const shimDisconnect = this.storage?.getItem(this.shimDisconnectKey);

      const accounts = (await this.#provider?.request({
        method: 'eth_requestAccounts',
        params: [],
      })) as Address[];

      const selectedAccount: Address = accounts?.[0] ?? '0x';

      if(this.#debug) {
        console.debug(
          `MetaMaskConnector::connect() TEST authorization ${Date.now()} authorized=${this.#sdk
            ._getConnection()
            ?.isAuthorized()}}`,
        );
      }

      // backward compatibility with older wallet version that return accounts before authorization
      if (!this.#sdk._getConnection()?.isAuthorized()) {
        const waitForAuthorized = () => {
          return new Promise((resolve) => {
            this.#sdk
              ._getConnection()
              ?.getConnector()
              .once(EventType.AUTHORIZED, () => {
                resolve(true);
              });
          });
        };
        await waitForAuthorized();
      }

      let providerChainId: string | null | undefined = this.#provider?.chainId;
      if (!providerChainId) {
        // request chainId from provider
        try {
          providerChainId = (await this.#provider?.request({
            method: 'eth_chainId',
            params: [],
          })) as string;
        } catch (error) {
          console.warn(`MetamaskConnector::connect() provider chainId error -- reset to mainnet`, error);
          // use default mainnet provider
          providerChainId = '0x1';
        }
      }

      const chain = {
        id: parseInt(providerChainId, 16),
        unsupported: false,
      };

      if (chainId !== undefined && chain.id !== chainId) {
        const newChain = await this.switchChain(chainId);
        const unsupported = this.isChainUnsupported(newChain.id);
        chain.id = newChain.id;
        chain.unsupported = unsupported;
      }

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
