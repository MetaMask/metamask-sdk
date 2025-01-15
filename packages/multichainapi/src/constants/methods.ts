// packages/multichainapi/src/constants/methods.ts
import MetaMaskOpenRPCDocument from '@metamask/api-specs';
import { parseCaipAccountId, parseCaipChainId } from '@metamask/utils';
import type { CaipAccountId, CaipChainId, Json } from '@metamask/utils';

/**
 * Methods that require an account parameter.
 */
export const METHODS_REQUIRING_PARAM_INJECTION = {
  eth_sendTransaction: true,
  eth_signTypedData_v4: true,
  personal_sign: true,
  eth_getBalance: true,
} as const;

/**
 * Injects address and chainId (where applicable) into example params for a given method.
 * @param method - The method to inject the address into.
 * @param exampleParams - The example params to inject the address into.
 * @param addressToInject - The address to inject.
 * @param scopeToInject - The scope to inject the address into.
 * @returns The updated example params with the address injected.
 */
export const injectParams = (
  method: string,
  exampleParams: Json,
  addressToInject: CaipAccountId,
  scopeToInject: CaipChainId,
): Json => {
  const { address: parsedAddress } = parseCaipAccountId(addressToInject);
  const { reference: chainId } = parseCaipChainId(scopeToInject);

  if (
    !(method in METHODS_REQUIRING_PARAM_INJECTION) ||
    typeof exampleParams !== 'object' ||
    exampleParams === null ||
    !('method' in exampleParams) ||
    !('params' in exampleParams) ||
    !Array.isArray(exampleParams.params)
  ) {
    return exampleParams;
  }

  switch (method) {
    case 'eth_sendTransaction':
      if (
        exampleParams.params.length > 0 &&
        typeof exampleParams.params[0] === 'object' &&
        exampleParams.params[0] !== null
      ) {
        return {
          ...exampleParams,
          params: [
            {
              ...exampleParams.params[0],
              from: parsedAddress,
              to: parsedAddress,
              value: '0x0',
            },
            ...exampleParams.params.slice(1),
          ],
        };
      }
      break;

    case 'personal_sign':
      if (exampleParams.params.length >= 2) {
        return {
          ...exampleParams,
          params: [
            exampleParams.params[0],
            parsedAddress,
            ...exampleParams.params.slice(2),
          ] as Json[],
        };
      }
      break;

    case 'eth_signTypedData_v4':
      if (
        exampleParams.params.length >= 2 &&
        typeof exampleParams.params[1] === 'object' &&
        exampleParams.params[1] !== null
      ) {
        const typedData = exampleParams.params[1];
        if (
          typeof typedData === 'object' &&
          typedData !== null &&
          'domain' in typedData &&
          typeof typedData.domain === 'object' &&
          typedData.domain !== null
        ) {
          return {
            ...exampleParams,
            params: [
              parsedAddress,
              {
                ...typedData,
                domain: {
                  ...typedData.domain,
                  chainId,
                },
              },
            ],
          };
        }
      }
      break;

    case 'eth_getBalance':
      return {
        ...exampleParams,
        params: [parsedAddress, 'latest'],
      };

    default:
      break;
  }

  return exampleParams;
};

/**
 * Known Wallet RPC methods.
 */
export const KnownWalletRpcMethods: string[] = [
  'wallet_registerOnboarding',
  'wallet_scanQRCode',
];

/**
 * Wallet methods that are EIP-155 compatible but not scoped to a specific chain.
 */
export const WalletEip155Methods = ['wallet_addEthereumChain'];

/**
 * EIP-155 specific notifications.
 */
export const Eip155Notifications = ['eth_subscription'];

/**
 * Methods that are only available in the EIP-1193 wallet provider.
 */
const Eip1193OnlyMethods = [
  'wallet_switchEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'eth_requestAccounts',
  'eth_accounts',
  'eth_coinbase',
  'net_version',
  'metamask_logWeb3ShimUsage',
  'metamask_getProviderState',
  'metamask_sendDomainMetadata',
  'wallet_registerOnboarding',
];

/**
 * All MetaMask methods, except for ones we have specified in the constants above.
 */
export const Eip155Methods = MetaMaskOpenRPCDocument.methods
  // eslint-disable-next-line @typescript-eslint/no-shadow
  .map(({ name }: { name: string }) => name)
  .filter((method: string) => !WalletEip155Methods.includes(method))
  .filter((method: string) => !KnownWalletRpcMethods.includes(method))
  .filter((method: string) => !Eip1193OnlyMethods.includes(method));
