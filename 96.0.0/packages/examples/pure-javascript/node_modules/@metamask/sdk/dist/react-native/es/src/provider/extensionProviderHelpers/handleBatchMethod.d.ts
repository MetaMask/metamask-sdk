import { MetaMaskInpageProvider } from '@metamask/providers';
import { MetaMaskSDK } from '../../sdk';
import { RequestArguments } from '../wrapExtensionProvider';
export declare const handleBatchMethod: ({ target, args, trackEvent, sdkInstance, }: {
    target: MetaMaskInpageProvider;
    args: RequestArguments;
    trackEvent: boolean;
    sdkInstance: MetaMaskSDK;
}) => Promise<(Partial<unknown> | null | undefined)[]>;
//# sourceMappingURL=handleBatchMethod.d.ts.map