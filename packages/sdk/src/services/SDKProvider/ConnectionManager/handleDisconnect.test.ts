/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ethErrors } from 'eth-rpc-errors';
import { SDKProvider } from '../../../provider/SDKProvider';
import * as loggerModule from '../../../utils/logger';
import { handleDisconnect } from './handleDisconnect';

describe('handleDisconnect', () => {
  let mockSDKProvider: SDKProvider;
  const mockEmit: jest.Mock = jest.fn();
  const mockHandleAccountsChanged: jest.Mock = jest.fn();
  const mockIsConnected: jest.Mock = jest.fn(() => true);
  const mockGetSelectedAddress = jest.fn();
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockSDKProvider = {
      getSelectedAddress: mockGetSelectedAddress,
      state: {
        providerStateRequested: true,
      },
      _state: {
        isConnected: true,
        accounts: ['someAccount'],
        isUnlocked: true,
        isPermanentlyDisconnected: false,
        initialized: true,
      },
      chainId: 'someChainId',
      selectedAddress: 'someAddress',
      _handleAccountsChanged: mockHandleAccountsChanged,
      emit: mockEmit,
      isConnected: mockIsConnected,
    } as unknown as SDKProvider;
  });

  it('should log debug information', () => {
    jest.spyOn(console, 'debug').mockImplementation();
    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(spyLogger).toHaveBeenCalledWith(
      '[SDKProvider: handleDisconnect()] cleaning up provider state terminate=false',
      mockSDKProvider,
    );
  });

  it('should handle terminate flag', () => {
    handleDisconnect({ terminate: true, instance: mockSDKProvider });

    // @ts-ignore
    expect(mockSDKProvider._state.accounts).toBeNull();
    // @ts-ignore
    expect(mockSDKProvider._state.isUnlocked).toBe(false);
    // @ts-ignore
    expect(mockSDKProvider._state.isPermanentlyDisconnected).toBe(true);
    // @ts-ignore
    expect(mockSDKProvider._state.initialized).toBe(false);
  });

  it('should update instance._state.isConnected', () => {
    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    // @ts-ignore
    expect(mockSDKProvider._state.isConnected).toBe(false);
  });

  it('should emit a disconnect event', () => {
    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(mockEmit).toHaveBeenCalledWith(
      'disconnect',
      ethErrors.provider.disconnected(),
    );
  });

  it('should set providerStateRequested to false', () => {
    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(mockSDKProvider.state.providerStateRequested).toBe(false);
  });

  it('should call _handleAccountsChanged with empty array', () => {
    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(mockHandleAccountsChanged).toHaveBeenCalledWith([]);
  });

  it('should interrupt disconnection', () => {
    mockIsConnected.mockReturnValueOnce(false);

    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(mockSDKProvider.chainId).toBe('someChainId');
    // @ts-ignore
    expect(mockSDKProvider._state.isConnected).toBe(false);
  });

  it('should not interrupt disconnection when connected', () => {
    mockIsConnected.mockReturnValue(true);

    handleDisconnect({ terminate: false, instance: mockSDKProvider });

    expect(mockEmit).toHaveBeenCalledWith(
      'disconnect',
      ethErrors.provider.disconnected(),
    );
    // @ts-ignore
    expect(mockSDKProvider._state.isConnected).toBe(false);
    expect(mockHandleAccountsChanged).toHaveBeenCalledWith([]);
  });
});
