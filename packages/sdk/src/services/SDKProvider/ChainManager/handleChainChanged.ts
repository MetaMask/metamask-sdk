import { SDKProvider } from '../../../provider/SDKProvider';

export function handleChainChanged({
  instance,
  chainId,
  networkVersion,
  superHandleChainChanged,
}: {
  chainId?: string;
  networkVersion?: string;
  instance: SDKProvider;
  superHandleChainChanged: (args: {
    chainId?: string;
    networkVersion?: string;
  }) => void;
}) {
  if (instance.debug) {
    console.debug(
      `SDKProvider::_handleChainChanged chainId=${chainId} networkVersion=${networkVersion}`,
    );
  }

  // FIXME on RN IOS networkVersion is sometime missing? why?
  let forcedNetworkVersion = networkVersion;
  if (!networkVersion) {
    console.info(`forced network version to prevent provider error`);
    forcedNetworkVersion = '1';
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._state.isConnected = true;
  instance.emit('connect', { chainId });
  superHandleChainChanged({
    chainId,
    networkVersion: forcedNetworkVersion,
  });
}
