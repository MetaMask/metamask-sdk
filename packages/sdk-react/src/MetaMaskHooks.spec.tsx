import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useSDK } from './MetaMaskHooks';
import { SDKContext } from './MetaMaskProvider';

function TestComponent() {
  const { account } = useSDK();
  return <div>{account}</div>;
}

describe('useSDK hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the context value if used within the SDKContext provider', () => {
    const dummyValue = {
      sdk: undefined,
      ready: true,
      connected: true,
      provider: undefined,
      connecting: false,
      account: '0xYourAddress',
      chainId: '0x1',
      error: undefined,
      status: undefined,
    };

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
