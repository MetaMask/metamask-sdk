import { useContext } from 'react';
import { SDKContext } from './MetaMaskProvider';

export const useSDK = () => {
  const context = useContext(SDKContext);

  if (context === undefined) {
    throw new Error('SDK context is missing, must be within provide');
  }
  return context;
};
