import type { MouseEventHandler } from 'react';
import React from 'react';
import './WalletList.css';

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
                    Extension ID: {wallet.params.extensionId}
                  </p>
                  <button
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
