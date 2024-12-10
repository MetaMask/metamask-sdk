import { BaseProvider } from './BaseProvider';
import type { RequestArguments } from './BaseProvider';
import type { EIP6963AnnounceProviderEvent, EIP6963ProviderDetail, EIP6963ProviderInfo, EIP6963RequestProviderEvent } from './EIP6963';
import { announceProvider as eip6963AnnounceProvider, requestProvider as eip6963RequestProvider } from './EIP6963';
import { createExternalExtensionProvider } from './extension-provider/createExternalExtensionProvider';
import { initializeProvider, setGlobalProvider } from './initializeInpageProvider';
import { MetaMaskInpageProvider, MetaMaskInpageProviderStreamName } from './MetaMaskInpageProvider';
import { shimWeb3 } from './shimWeb3';
import { StreamProvider } from './StreamProvider';
import type { ConsoleLike } from './utils';
export type { ConsoleLike, RequestArguments, EIP6963AnnounceProviderEvent, EIP6963ProviderDetail, EIP6963ProviderInfo, EIP6963RequestProviderEvent, };
export { BaseProvider, createExternalExtensionProvider, initializeProvider, MetaMaskInpageProviderStreamName, MetaMaskInpageProvider, setGlobalProvider, shimWeb3, StreamProvider, eip6963AnnounceProvider, eip6963RequestProvider, };
//# sourceMappingURL=index.d.ts.map