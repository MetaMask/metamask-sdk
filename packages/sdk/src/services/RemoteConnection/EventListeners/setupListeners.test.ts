import { EventType, TrackingEvents } from '@metamask/sdk-communication-layer';
import { Ethereum } from '../../Ethereum';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { setupListeners } from './setupListeners';

jest.mock('../../Ethereum', () => ({
  Ethereum: {
    getProvider: jest.fn().mockReturnValue({
      request: jest.fn(),
      _setConnected: jest.fn(),
      forceInitializeState: jest.fn(),
      handleDisconnect: jest.fn(),
      getState: jest.fn(),
    }),
  },
}));

describe('setupListeners', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;

  const mockConnectorOn = jest.fn();
  const mockOnPendingModalDisconnect = jest.fn();
  const mockUpdateOTPValue = jest.fn();
  const mockOtpModal = jest.fn();
  const mocksIsSecure = jest.fn();
  const mockIsBrowser = jest.fn();
  const mockIsAuthorized = jest.fn();
  const mockSendAnalytics = jest.fn();
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockIsAuthorized.mockReturnValue(true);

    state = {
      connector: {
        on: mockConnectorOn,
        isAuthorized: mockIsAuthorized,
        disconnect: mockDisconnect,
      },
      developerMode: false,
      platformManager: {
        isSecure: mocksIsSecure,
        isBrowser: mockIsBrowser,
      },
      pendingModal: {
        updateOTPValue: mockUpdateOTPValue,
      },
      analytics: {
        send: mockSendAnalytics,
      },
    } as unknown as RemoteConnectionState;

    options = {
      modals: {
        onPendingModalDisconnect: mockOnPendingModalDisconnect,
        otp: mockOtpModal,
      },
    } as unknown as RemoteConnectionProps;
  });

  it('should not set listeners if no connector is present', () => {
    state.connector = undefined;

    setupListeners(state, options);

    expect(mockConnectorOn).not.toHaveBeenCalled();
  });

  it('should handle OTP event when platform is secure and pendingModal is present', () => {
    state.pendingModal = undefined;
    mocksIsSecure.mockReturnValue(false);

    setupListeners(state, options);

    const otpCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.OTP,
    )[1];

    otpCallback('test_otp');

    expect(state.otpAnswer).toBe('test_otp');
    expect(mockOtpModal).toHaveBeenCalled();
  });

  it('should handle SDK_RPC_CALL event', async () => {
    setupListeners(state, options);

    const sdkRpcCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.SDK_RPC_CALL,
    )[1];

    const mockRequestParams = {
      method: 'testMethod',
      params: ['testParam'],
    };
    await sdkRpcCallback(mockRequestParams);

    const provider = Ethereum.getProvider();
    expect(provider.request).toHaveBeenCalledWith(mockRequestParams);
  });

  it('should handle CLIENTS_DISCONNECTED event when platform is not secure', () => {
    mocksIsSecure.mockReturnValue(false);

    setupListeners(state, options);

    const clientsDisconnectedCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.CLIENTS_DISCONNECTED,
    )[1];

    clientsDisconnectedCallback();

    const provider = Ethereum.getProvider();
    expect(provider.handleDisconnect).toHaveBeenCalledWith({
      terminate: false,
    });
    expect(state.pendingModal?.updateOTPValue).toHaveBeenCalledWith('');
  });

  it('should handle TERMINATE event', () => {
    setupListeners(state, options);

    const terminateCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.TERMINATE,
    )[1];

    terminateCallback();

    expect(state.otpAnswer).toBeUndefined();
    expect(state.authorized).toBe(false);

    const provider = Ethereum.getProvider();
    expect(provider.handleDisconnect).toHaveBeenCalledWith({ terminate: true });
  });

  it('should handle AUTHORIZED event', () => {
    setupListeners(state, options);

    const authorizedCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.AUTHORIZED,
    )[1];

    authorizedCallback();

    const provider = Ethereum.getProvider();
    expect(provider._setConnected).toHaveBeenCalled();
    expect(provider.forceInitializeState).toHaveBeenCalled();
  });

  it('should handle CLIENTS_DISCONNECTED event when platform is secure', () => {
    mocksIsSecure.mockReturnValue(true);

    setupListeners(state, options);

    const clientsDisconnectedCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.CLIENTS_DISCONNECTED,
    )[1];

    clientsDisconnectedCallback();

    const provider = Ethereum.getProvider();

    expect(provider.handleDisconnect).not.toHaveBeenCalled();
    expect(state.pendingModal?.updateOTPValue).not.toHaveBeenCalled();
  });

  it('should handle TERMINATE event and reset all state properties', () => {
    state.otpAnswer = 'test_otp';
    state.authorized = true;

    setupListeners(state, options);

    const terminateCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.TERMINATE,
    )[1];

    terminateCallback();

    expect(state.otpAnswer).toBeUndefined();
    expect(state.authorized).toBe(false);

    const provider = Ethereum.getProvider();
    expect(provider.handleDisconnect).toHaveBeenCalledWith({ terminate: true });
  });

  it('should handle SDK_RPC_CALL event with different request parameters', async () => {
    setupListeners(state, options);

    const sdkRpcCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.SDK_RPC_CALL,
    )[1];

    const anotherMockRequestParams = {
      method: 'anotherTestMethod',
      params: ['anotherTestParam'],
    };

    await sdkRpcCallback(anotherMockRequestParams);

    const provider = Ethereum.getProvider();
    expect(provider.request).toHaveBeenCalledWith(anotherMockRequestParams);
  });

  it('should not handle OTP event when platform is secure', () => {
    mocksIsSecure.mockReturnValue(true);

    setupListeners(state, options);

    const otpCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.OTP,
    )?.[1];

    expect(otpCallback).toBeUndefined();
    expect(state.otpAnswer).toBeUndefined();
  });

  it('should handle TERMINATE event without rejected connection', () => {
    mockIsAuthorized.mockReturnValue(true);

    setupListeners(state, options);

    const terminateCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.TERMINATE,
    )[1];

    terminateCallback();

    expect(mockSendAnalytics).not.toHaveBeenCalledWith({
      event: TrackingEvents.REJECTED,
    });
  });

  it('should handle error in AUTHORIZED event', async () => {
    const mockProvider = {
      _setConnected: jest.fn(),
      forceInitializeState: jest
        .fn()
        .mockRejectedValue(new Error('Mock Error')),
    };
    (Ethereum.getProvider as jest.MockedFunction<any>).mockReturnValue(
      mockProvider,
    );

    setupListeners(state, options);

    const authorizedCallback = mockConnectorOn.mock.calls.find(
      ([event]) => event === EventType.AUTHORIZED,
    )[1];

    await authorizedCallback();

    expect(mockProvider._setConnected).toHaveBeenCalled();
    expect(mockProvider.forceInitializeState).toHaveBeenCalled();
  });
});
