import { MetaMaskInpageProvider } from '@metamask/providers';
import { MetaMaskSDK } from '../sdk';
export interface RequestArguments {
    method: string;
    params?: any[];
}
export declare const wrapExtensionProvider: ({ provider, sdkInstance, }: {
    provider: MetaMaskInpageProvider;
    sdkInstance: MetaMaskSDK;
}) => MetaMaskInpageProvider;
//# sourceMappingURL=wrapExtensionProvider.d.ts.map