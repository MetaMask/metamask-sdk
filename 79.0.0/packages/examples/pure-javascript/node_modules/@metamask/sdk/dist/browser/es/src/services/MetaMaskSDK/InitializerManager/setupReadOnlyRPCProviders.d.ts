import { MetaMaskSDK } from '../../../sdk';
export interface RPC_URLS_MAP {
    [chainId: `0x${string}`]: string;
}
export declare const setupReadOnlyRPCProviders: (instance: MetaMaskSDK) => Promise<void>;
//# sourceMappingURL=setupReadOnlyRPCProviders.d.ts.map