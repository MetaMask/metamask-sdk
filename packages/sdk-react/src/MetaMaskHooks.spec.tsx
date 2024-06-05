import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useSDK, useSDKConfig } from './MetaMaskHooks';
import { SDKContext } from './MetaMaskProvider';
import { SDKConfigProvider } from './SDKConfigProvider';

// TestComponent for useSDK
function TestComponent() {
  const { account } = useSDK();
  return <div>{account}</div>;
}

// TestComponent for useSDKConfig
function TestConfigComponent() {
  const { socketServer, infuraAPIKey, useDeeplink, checkInstallationImmediately } = useSDKConfig();
  return (
    <div>
      <div>{socketServer}</div>
      <div>{infuraAPIKey}</div>
      <div>{useDeeplink ? 'true' : 'false'}</div>
      <div>{checkInstallationImmediately ? 'true' : 'false'}</div>
    </div>
  );
}

describe('useSDK', () => {
  let dummyValue = {
    sdk: undefined,
    ready: true,
    connected: true,
    provider: undefined,
    connecting: false,
    account: '0xYourAddress',
    chainId: '0x1',
    error: undefined,
    status: undefined,
    readOnlyCalls: false,
    extensionActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dummyValue = {
      sdk: undefined,
      ready: true,
      connected: true,
      provider: undefined,
      connecting: false,
      account: '0xYourAddress',
      chainId: '0x1',
      error: undefined,
      status: undefined,
      readOnlyCalls: false,
      extensionActive: true,
    };
  });

  it('should return the context value if used within the SDKContext provider', () => {
    render(
      <SDKContext.Provider value={dummyValue}>
        <TestComponent />
      </SDKContext.Provider>,
    );

    expect(screen.getByText(dummyValue.account)).toBeInTheDocument();
  });

  it('should throw an error if used outside of the SDKContext provider', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => {
      return undefined;
    });

    expect(() => {
      render(<TestComponent />);
    }).toThrow('SDK context is missing, must be within provide');
  });
});

describe('useSDKConfig', () => {
  let dummyConfigValue = {
    socketServer: 'wss://example.com',
    infuraAPIKey: 'testInfuraAPIKey',
    useDeeplink: true,
    checkInstallationImmediately: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dummyConfigValue = {
      socketServer: 'wss://example.com',
      infuraAPIKey: 'testInfuraAPIKey',
      useDeeplink: true,
      checkInstallationImmediately: true,
    };
  });

  it('should throw an error if used outside of the SDKConfigContext', () => {
    jest.spyOn(React, 'useContext').mockImplementation(() => {
      return undefined;
    });

    expect(() => {
      render(<TestConfigComponent />);
    }).toThrow('useSDKConfig must be used within a SDKConfigContext');
  })
});
