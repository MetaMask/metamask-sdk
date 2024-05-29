import { useContext } from 'react';
import { SDKContext } from './MetaMaskProvider';
import { SDKConfigContext } from './SDKConfigProvider';

export const useSDK = () => {
  const context = useContext(SDKContext);

  if (context === undefined) {
    throw new Error('SDK context is missing, must be within provider');
  }
  return context;
};

export const useSDKConfig = () => {
  const context = useContext(SDKConfigContext);
  if (context === undefined) {
    throw new Error('useSDKConfig must be used within a SDKConfigContext');
  }
  return context;
};
