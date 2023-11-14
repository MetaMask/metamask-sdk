import React from 'react';
import { useSDK } from '@metamask/sdk-react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ItemView from './ItemView';

interface SDKStatusProps {
  response: unknown;
  requesting?: boolean;
  error?: any;
}

export const SDKStatus = ({ response, requesting, error }: SDKStatusProps) => {
  const {
    connected,
    connecting,
    balance,
    status: serviceStatus,
    extensionActive,
    account,
    sdk,
    chainId,
  } = useSDK();

  return (
    <div id="header">
      {connecting && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} pulse />
          </span>
          <span>Waiting for Metamask to link the connection...</span>
        </div>
      )}
      {connected && (
        <div className="data-container">
          <ItemView label="SDK Version" value={sdk?.getVersion()} />
          {!extensionActive && (
            <>
              <ItemView
                label="Socket Server"
                value={serviceStatus?.channelConfig?.channelId}
              />
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
          <ItemView label="Connected" value={connected ? 'YES' : 'NO'} />
          <ItemView
            label="Extension active"
            value={extensionActive ? 'YES' : 'NO'}
          />
          <ItemView label="Connected chain" value={chainId} />
          <ItemView label="Connected account" value={account} />
          <ItemView label="Account balance" value={balance} />
          {error ? (
            <ItemView
              label="Last request error"
              processing={requesting}
              contentStyle={{ color: 'red' }}
              value={JSON.stringify({
                code: error.code,
                message: error.message,
              })}
            />
          ) : (
            <ItemView
              label="Last request response"
              processing={requesting}
              value={JSON.stringify(response)}
            />
          )}
        </div>
      )}
    </div>
  );
};
