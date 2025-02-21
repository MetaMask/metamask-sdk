import { useState, useCallback } from 'react';

interface UseConnectionReturn {
  connectionError: string | null;
  handleConnect: () => Promise<void>;
  setConnectionError: (error: string | null) => void;
}

export function useConnection(
  connect: (params: { extensionId: string }) => Promise<boolean>,
): UseConnectionReturn {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    try {
      setConnectionError(null);
      await connect({ extensionId: 'nfdjnfhlblppdgdplngdjgpifllaamoc' });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to connect to MetaMask';
      setConnectionError(errorMessage);
      console.error('Connection error:', error);
    }
  }, [connect]);

  return {
    connectionError,
    handleConnect,
    setConnectionError,
  };
}
