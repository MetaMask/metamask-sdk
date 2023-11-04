import { useSDK } from '@metamask/sdk-react';
import ItemView from './ItemView';

interface SDKStatusProps {
  response: unknown;
  requesting?: boolean;
}

export default function SDKStatus({ response, requesting }: SDKStatusProps) {
  const {
    connected,
    connecting,
    balance,
    status: serviceStatus,
    extensionActive,
    account,
    chainId,
  } = useSDK();

  return (
    <div id="header">
      {connecting && <div>Waiting for Metamask to link the connection...</div>}
      {connected && (
        <div className="data-container">
          {!extensionActive && (
            <>
              <ItemView
                label="ChannelId"
                value={serviceStatus?.channelConfig?.channelId}
              />
              <ItemView
                label="Expiration"
                value={
                  serviceStatus?.channelConfig?.validUntil.toString() ?? ''
                }
              />
            </>
          )}
          <ItemView
            label="Extension active"
            value={extensionActive ? 'YES' : 'NO'}
          />
          <ItemView label="Connected chain" value={chainId} />
          <ItemView label="Connected account" value={account} />
          <ItemView label="Account balance" value={balance} />
          <ItemView
            label="Last request response"
            processing={requesting}
            value={JSON.stringify(response)}
          />
          <ItemView label="Connected" value={connected ? 'YES' : 'NO'} />
        </div>
      )}
    </div>
  );
}
