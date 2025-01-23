"use client";

import { createMetamaskMultichain, MetamaskMultichain } from '@metamask/sdk-multichain';
import { ProviderType } from '@metamask/sdk-multichain/src/providers/ExtensionProvider';
import { useEffect } from 'react';
import { useState } from 'react';

const EXTENSION_ID = 'eklmonnmoaepkgaomjcefmimkkfikokn';

export default function Home() {
  const [client, setClient] = useState<MetamaskMultichain | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const multichain = createMetamaskMultichain({
      preferredProvider: ProviderType.CHROME_EXTENSION
    });

    multichain.addListener('sessionChanged', (event) => {
      console.log('Session event:', event.type);
      console.log('Session data:', event.session);
      setSessionData(event.session);
    });

    setClient(multichain);

    return () => {
      multichain.removeListener('sessionChanged', () => { });
    };
  }, []);

  const handleConnect = async () => {
    try {
      await client?.connect({ extensionId: EXTENSION_ID });

      const session = await client?.createSession({
        requiredScopes: {
          'eip155:1': {
            methods: ['eth_sendTransaction', 'personal_sign'],
            notifications: ['accountsChanged', 'chainChanged']
          }
        }
      });

      console.log("Session created:", session);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleConnect}
        className="px-4 py-2 mb-4 bg-blue-500 text-white rounded"
      >
        Connect
      </button>

      <div className="ml-2 inline-block">
        <BlockNumber client={client} sessionData={sessionData} />
      </div>
    </div>
  );
}

interface BlockNumberProps {
  client: MetamaskMultichain | null;
  sessionData: any;
}

export function BlockNumber({ client, sessionData }: BlockNumberProps) {
  const [blockNumber, setBlockNumber] = useState<string | null>(null);

  const handleGetBlockNumber = async () => {
    try {
      const result = await client?.invokeMethod({
        scope: 'eip155:1',
        request: {
          method: 'eth_blockNumber',
          params: []
        }
      });

      console.log("result", result);

      // if (typeof result === 'object' && result?.[0]?.result) {
      //   const decimal = parseInt(result[0].result as string, 16).toString();
      //   setBlockNumber(decimal);
      // }
    } catch (error) {
      console.error("Failed to get block number:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleGetBlockNumber}
        disabled={!sessionData}
        className={`px-4 py-2 rounded ${sessionData
          ? 'bg-green-500 text-white'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        Get Block Number
      </button>

      {blockNumber && (
        <div className="mt-4">
          Current Block Number: {blockNumber}
        </div>
      )}
    </div>
  );
}