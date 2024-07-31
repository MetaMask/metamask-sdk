import { MetaMaskInpageProvider } from '@metamask/providers';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';
export declare const handleBatchMethod: ({ params, target, args, trackEvent, provider, sdkInstance, }: {
    params: any[];
    target: MetaMaskInpageProvider;
    args: RequestArguments;
    trackEvent: boolean;
    provider: MetaMaskInpageProvider;
    sdkInstance: MetaMaskSDK;
}) => Promise<import("@metamask/providers/dist/types/utils").Maybe<unknown>>;
//# sourceMappingURL=handleBatchMethod.d.ts.map