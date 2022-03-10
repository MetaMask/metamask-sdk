import { initializeProvider as initProvider } from '@metamask/providers';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ProviderConstants } from '../constants';

const initializeProvider = () => {
  // Setup stream for content script communication
  const metamaskStream = new WindowPostMessageStream({
    name: ProviderConstants.INPAGE,
    target: ProviderConstants.CONTENT_SCRIPT,
  });

  // Initialize provider object (window.ethereum)
  initProvider({
    // @ts-ignore
    connectionStream: metamaskStream,
    shouldSendMetadata: false,
  });
};

export default initializeProvider;
