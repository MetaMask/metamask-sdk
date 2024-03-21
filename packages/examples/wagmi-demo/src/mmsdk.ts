import {
  EventType,
  type MetaMaskSDK,
  type MetaMaskSDKOptions,
  type SDKProvider,
} from '@metamask/sdk'
import {
  ChainNotConfiguredError,
  createConnector,
  normalizeChainId,
} from '@wagmi/core'
import type { Evaluate, ExactPartial, Omit } from '@wagmi/core/internal'
import {
  type Address,
  type ProviderConnectInfo,
  type ProviderRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  numberToHex,
} from 'viem'

export type MetaMaskParameters = Evaluate<
  ExactPartial<
    Omit<
      MetaMaskSDKOptions,
      | 'checkInstallationImmediately'
      | 'checkInstallationOnAllCalls'
      | 'defaultReadOnlyChainId'
      | 'readonlyRPCMap'
    >
  >
>

metaMask.type = 'metaMask' as const

export function metaMask(parameters: MetaMaskParameters = {}) {
  type Provider = SDKProvider
  type Properties = {
    onConnect(connectInfo: ProviderConnectInfo): void
  }
  type StorageItem = { 'metaMaskSDK.disconnected': true }
  type Listener = Parameters<Provider['on']>[1]

  let sdk: MetaMaskSDK
  let sdkImport: Promise<typeof import('@metamask/sdk')> | undefined

  return createConnector<Provider, Properties, StorageItem>((config) => ({
    id: 'metaMaskSDK',
    name: 'MetaMask',
    type: metaMask.type,
    async setup() {
      if (!sdkImport) {
        // Only load once
        sdkImport = import('@metamask/sdk') as any
      }

      const sdkModule = await sdkImport
      if (!sdkModule) {
        throw new Error('MetaMask SDK not found')
      }

      if (!parameters || !parameters.dappMetadata) {
        throw new Error('dappMetadata is required and must be provided.')
      }

      sdk = new sdkModule.MetaMaskSDK({
        ...parameters,
        dappMetadata: parameters.dappMetadata,
        _source: 'wagmi',
        readonlyRPCMap: Object.fromEntries(
          config.chains.map((chain) => [
            chain.id,
            chain.rpcUrls.default.http[0]!,
          ]),
        ),
      })
      await sdk.init()

      sdk?.getProvider()?.on('connect', this.onConnect.bind(this) as Listener)
    },
    async connect({ chainId } = {}) {
      const provider = await this.getProvider()

      let accounts: readonly Address[] | null = null

      try {
        accounts = (await sdk.connect()) as Address[]

        if (!accounts?.length) {
          const requestedAccounts = (await sdk.connect()) as string[]
          accounts = requestedAccounts.map((x) => getAddress(x))
        }

        provider.removeListener(
          'connect',
          this.onConnect.bind(this) as Listener,
        )
        provider.on(
          'accountsChanged',
          this.onAccountsChanged.bind(this) as Listener,
        )
        provider.on('chainChanged', this.onChainChanged as Listener)
        provider.on('disconnect', this.onDisconnect.bind(this) as Listener)

        // Backward compatibility with older wallet (<7.3) version that return accounts before authorization
        if (!sdk.isExtensionActive() && !sdk._getConnection()?.isAuthorized()) {
          // @ts-ignore
          function waitForAuthorized() {
            return new Promise((resolve) => {
              const connection = sdk._getConnection()
              const connector = connection?.getConnector()
              connector?.once(EventType.AUTHORIZED, () => resolve(true))
            })
          }
          await waitForAuthorized()
        }

        // Switch to chain if provided
        let currentChainId = await this.getChainId()
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId }).catch((error) => {
            if (error.code === UserRejectedRequestError.code) throw error
            return { id: currentChainId }
          })
          currentChainId = chain?.id ?? currentChainId
        }

        await config.storage?.removeItem('metaMaskSDK.disconnected')

        return { accounts, chainId: currentChainId }
      } catch (err) {
        const error = err as RpcError
        if (error.code === UserRejectedRequestError.code)
          throw new UserRejectedRequestError(error)
        if (error.code === ResourceUnavailableRpcError.code)
          throw new ResourceUnavailableRpcError(error)
        throw error
      }
    },
    async disconnect() {
      const provider = await this.getProvider()

      provider.removeListener(
        'accountsChanged',
        this.onAccountsChanged.bind(this),
      )
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))
      provider.on('connect', this.onConnect.bind(this) as Listener)

      sdk.terminate()

      // Add shim signalling connector is disconnected
      await config.storage?.setItem('metaMaskSDK.disconnected', true)
    },
    async getAccounts() {
      const provider = await this.getProvider()
      const accounts = (await provider.request({
        method: 'eth_accounts',
      })) as string[]
      return accounts.map((x) => getAddress(x))
    },
    async getChainId() {
      const provider = await this.getProvider()
      const chainId =
        provider.getChainId() ??
        (await provider?.request({ method: 'eth_chainId' }))
      return normalizeChainId(chainId)
    },
    async getProvider() {
      if (!sdk) {
        throw new Error(
          'MetaMask SDK provider is not available. Ensure the MetaMask SDK is initialized and connected.',
        )
      }

      return sdk.getProvider()!
    },
    async isAuthorized() {
      try {
        const isDisconnected =
          // If shim exists in storage, connector is disconnected
          await config.storage?.getItem('metaMaskSDK.disconnected')
        if (isDisconnected) return false

        const accounts = await this.getAccounts()
        return !!accounts.length
      } catch {
        return false
      }
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider()

      const chain = config.chains.find((x) => x.id === chainId)
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

      try {
        await Promise.all([
          provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: numberToHex(chainId) }],
          }),
          new Promise<void>((resolve) =>
            config.emitter.once('change', ({ chainId: currentChainId }) => {
              if (currentChainId === chainId) resolve()
            }),
          ),
        ])
        return chain
      } catch (err) {
        const error = err as RpcError

        // Indicates chain is not added to provider
        if (
          error.code === 4902 ||
          // Unwrapping for MetaMask Mobile
          // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
          (error as ProviderRpcError<{ originalError?: { code: number } }>)
            ?.data?.originalError?.code === 4902
        ) {
          try {
            const { default: blockExplorer, ...blockExplorers } =
              chain.blockExplorers ?? {}
            let blockExplorerUrls: string[] = []
            if (blockExplorer)
              blockExplorerUrls = [
                blockExplorer.url,
                ...Object.values(blockExplorers).map((x) => x.url),
              ]

            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: numberToHex(chainId),
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpcUrls.default?.http[0] ?? ''],
                  blockExplorerUrls,
                },
              ],
            })

            const currentChainId = await this.getChainId()
            if (currentChainId !== chainId)
              throw new UserRejectedRequestError(
                new Error('User rejected switch after adding network.'),
              )

            return chain
          } catch (error) {
            throw new UserRejectedRequestError(error as Error)
          }
        }

        if (error.code === UserRejectedRequestError.code)
          throw new UserRejectedRequestError(error)
        throw new SwitchChainError(error)
      }
    },
    async onAccountsChanged(accounts) {
      // Disconnect if there are no accounts
      if (accounts.length === 0) this.onDisconnect()
      // Connect if emitter is listening for connect event (e.g. is disconnected and connects through wallet interface)
      else if (config.emitter.listenerCount('connect')) {
        const chainId = (await this.getChainId()).toString()
        this.onConnect({ chainId })
        await config.storage?.removeItem('metaMaskSDK.disconnected')
      }
      // Regular change event
      else
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        })
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain)
      config.emitter.emit('change', { chainId })
    },
    async onConnect(connectInfo) {
      const accounts = await this.getAccounts()
      if (accounts.length === 0) return

      const chainId = normalizeChainId(connectInfo.chainId)
      config.emitter.emit('connect', { accounts, chainId })

      const provider = await this.getProvider()
      if (provider) {
        provider.removeListener('connect', this.onConnect.bind(this))
        provider.on('accountsChanged', this.onAccountsChanged.bind(this) as any)
        provider.on('chainChanged', this.onChainChanged as any)
        provider.on('disconnect', this.onDisconnect.bind(this) as any)
      }
    },
    async onDisconnect(error) {
      const provider = await this.getProvider()

      // If MetaMask emits a `code: 1013` error, wait for reconnection before disconnecting
      // https://github.com/MetaMask/providers/pull/120
      if (error && (error as RpcError<1013>).code === 1013) {
        if (provider && !!(await this.getAccounts()).length) return
      }

      // No need to remove 'metaMaskSDK.disconnected' from storage because `onDisconnect` is typically
      // only called when the wallet is disconnected through the wallet's interface, meaning the wallet
      // actually disconnected and we don't need to simulate it.
      config.emitter.emit('disconnect')

      provider.removeListener(
        'accountsChanged',
        this.onAccountsChanged.bind(this),
      )
      provider.removeListener('chainChanged', this.onChainChanged)
      provider.removeListener('disconnect', this.onDisconnect.bind(this))
      provider.on('connect', this.onConnect.bind(this) as any)
    },
  }))
}
