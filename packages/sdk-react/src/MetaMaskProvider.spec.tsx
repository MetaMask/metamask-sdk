import '@testing-library/jest-dom';
import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import {
  MetaMaskSDK,
  MetaMaskSDKOptions,
  SDKProvider,
  ServiceStatus,
} from '@metamask/sdk';
import MetaMaskProvider, { SDKContext } from './MetaMaskProvider';
import { EthereumRpcError } from 'eth-rpc-errors';
import * as loggerModule from './utils/logger';

jest.mock('@metamask/sdk');

describe('MetaMaskProvider Component', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const mockMetaMaskSDK = MetaMaskSDK as jest.MockedClass<typeof MetaMaskSDK>;
  const initMock = jest.fn().mockResolvedValue(true);

  const mockSdkRemoveListener = jest.fn();
  const mockSdkHasReadOnlyRPCCalls = jest.fn();
  const mockSdkOn = jest.fn();
  const mockProviderRemoveListener = jest.fn();
  const mockIsExtensionActive = jest.fn(() => true);
  const mockProviderOn = jest.fn();
  const mockIsConnected = jest.fn().mockReturnValue(true);
  const mockRequest = jest.fn();

  const dummyChild = <div>Test Child</div>;
  let sdkOptions: MetaMaskSDKOptions = {
    dappMetadata: {
      url: 'url',
      name: 'name',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockMetaMaskSDK.mockImplementation(
      () =>
        ({
          hasReadOnlyRPCCalls: mockSdkHasReadOnlyRPCCalls,
          on: mockSdkOn,
          removeListener: mockSdkRemoveListener,
          init: initMock,
          isExtensionActive: mockIsExtensionActive,
          getProvider: jest.fn().mockReturnValue({
            isConnected: mockIsConnected,
            selectedAddress: '0xYourAddress',
            on: mockProviderOn,
            removeListener: mockProviderRemoveListener,
            request: mockRequest,
          }),
          getChannelId: jest.fn().mockReturnValue('MOCKED_channelId'),
          _getConnection: jest.fn(),
        } as unknown as MetaMaskSDK),
    );

    mockRequest.mockResolvedValue('0xYourAddress');

    mockSdkHasReadOnlyRPCCalls.mockReturnValue(false);

    sdkOptions = {
      dappMetadata: {
        url: 'url',
        name: 'name',
      },
    };
  });

  describe('Initialization Tests', () => {
    it('should instantiate the MetaMaskSDK correctly with sdkOptions', () => {
      render(
        <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
      );
      expect(MetaMaskSDK).toHaveBeenCalledWith(sdkOptions);
    });

    it('should handle successful sdk.init() call', async () => {
      await act(async () => {
        render(
          <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
        );
      });

      expect(initMock).toHaveBeenCalledTimes(1);
    });

    it('should prevent double SDK initialization', async () => {
      const { rerender } = render(
        <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
      );

      await act(async () => {
        rerender(
          <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
        );
      });

      expect(initMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Listener Tests', () => {
    it('should set up event listeners for the SDK and active provider', async () => {
      await act(async () => {
        render(
          <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
        );
      });

      expect(mockSdkOn).toHaveBeenCalledTimes(2);
      expect(mockProviderOn).toHaveBeenCalledTimes(6);

      expect(mockSdkOn.mock.calls).toEqual([
        ['service_status', expect.any(Function)],
        ['provider_update', expect.any(Function)],
      ]);

      expect(mockProviderOn.mock.calls).toEqual([
        ['_initialized', expect.any(Function)],
        ['connecting', expect.any(Function)],
        ['connect', expect.any(Function)],
        ['disconnect', expect.any(Function)],
        ['accountsChanged', expect.any(Function)],
        ['chainChanged', expect.any(Function)],
      ]);
    });

    it('should remove listeners correctly on component unmount', async () => {
      await act(async () => {
        render(
          <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
        );
      });

      cleanup();

      expect(mockSdkRemoveListener).toHaveBeenCalledTimes(2);
      expect(mockProviderRemoveListener).toHaveBeenCalledTimes(6);

      expect(mockSdkRemoveListener.mock.calls).toEqual([
        ['service_status', expect.any(Function)],
        ['provider_update', expect.any(Function)],
      ]);

      expect(mockProviderRemoveListener.mock.calls).toEqual([
        ['_initialized', expect.any(Function)],
        ['connecting', expect.any(Function)],
        ['connect', expect.any(Function)],
        ['disconnect', expect.any(Function)],
        ['accountsChanged', expect.any(Function)],
        ['chainChanged', expect.any(Function)],
      ]);
    });
  });

  describe('Other Effects and Callbacks', () => {
    it('should respond correctly to changes in effect dependencies', async () => {
      const { rerender } = render(
        <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
      );

      await act(async () => {
        rerender(
          <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
        );
      });

      expect(initMock).toHaveBeenCalledTimes(1);
    });

    it('should print debug logs', async () => {
      await act(async () => {
        render(
          <MetaMaskProvider
            sdkOptions={sdkOptions}
            children={dummyChild}
            debug
          />,
        );
      });

      expect(spyLogger).toHaveBeenCalled();
      expect(spyLogger.mock.calls[0][0]).toContain(
        '[MetaMaskProviderClient] init SDK Provider listeners',
      );
    });

    it('should not print debug logs when debug is false or undefined', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();

      render(
        <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
      );

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Context and Children Rendering', () => {
    it('should render children correctly inside the SDKContext.Provider', () => {
      const { getByText } = render(
        <MetaMaskProvider sdkOptions={sdkOptions} children={dummyChild} />,
      );

      expect(getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('should set readOnlyCalls state based on hasReadOnlyRPCCalls', async () => {
    mockSdkHasReadOnlyRPCCalls.mockReturnValue(true);

    let contextValue:
      | {
          sdk?: MetaMaskSDK;
          ready: boolean;
          connected: boolean;
          connecting: boolean;
          readOnlyCalls: boolean;
          provider?: SDKProvider;
          error?: EthereumRpcError<unknown>;
          chainId?: string;
          account?: string;
          status?: ServiceStatus;
        }
      | undefined;

    const TestComponent = () => {
      contextValue = React.useContext(SDKContext);
      return null;
    };

    await act(async () => {
      render(
        <MetaMaskProvider sdkOptions={sdkOptions}>
          <TestComponent />
        </MetaMaskProvider>,
      );
    });

    expect(contextValue?.readOnlyCalls).toBe(true);
  });
});
