import React from 'react';
import type { MouseEventHandler } from 'react';

import './WalletList.css';
import { WINDOW_POST_MESSAGE_ID } from '../constants';

export type WalletMapEntry = {
  params: {
    name: string;
    uuid: string;
    rdns: string;
    icon: string;
    extensionId?: string;
  };
};

type WalletListProps = {
  wallets: Record<string, WalletMapEntry>;
  handleClick: (extensionId: string) => Promise<void>;
  connectedExtensionId: string;
};

function WalletList({
  wallets,
  handleClick,
  connectedExtensionId,
}: WalletListProps) {
  const handleWalletClick =
    (extensionId: string): MouseEventHandler<HTMLButtonElement> =>
    (ev) => {
      ev.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleClick(extensionId);
    };

  if (Object.keys(wallets).length === 0) {
    return <p>No wallets detected</p>;
  }

  return (
    <div className="wallet-list">
      {Object.values(wallets).map((wallet) => {
        const isConnected = wallet.params.extensionId === connectedExtensionId;
        return (
          <div key={wallet.params.uuid} className="wallet-card">
            <img
              src={wallet.params.icon}
              alt={`${wallet.params.name} icon`}
              className="wallet-icon"
            />
            <div className="wallet-info">
              <h3 className="wallet-name">{wallet.params.name}</h3>
              <p className="wallet-uuid">UUID: {wallet.params.uuid}</p>
              <p className="wallet-rdns">RDNS: {wallet.params.rdns}</p>
              {wallet.params.extensionId && (
                <>
                  <p className="wallet-extension-id">
                    {wallet.params.extensionId === WINDOW_POST_MESSAGE_ID
                      ? null
                      : 'Extension ID: '}
                    {wallet.params.extensionId}
                  </p>
                  <button
                    type="button"
                    onClick={handleWalletClick(wallet.params.extensionId)}
                    disabled={isConnected}
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default WalletList;
