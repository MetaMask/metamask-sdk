/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Duplex } from 'stream';
import { handleDisconnect } from '../services/SDKProvider/ConnectionManager/handleDisconnect';
import { handleChainChanged } from '../services/SDKProvider/ChainManager/handleChainChanged';
import { initializeStateAsync } from '../services/SDKProvider/InitializationManager/initializeStateAsync';
import { initializeState } from '../services/SDKProvider/InitializationManager/initializeState';
import { SDKProvider, SDKProviderProps } from './SDKProvider';

jest.mock('../services/SDKProvider/ChainManager/handleChainChanged');
jest.mock('../services/SDKProvider/ConnectionManager/handleDisconnect');
jest.mock('../services/SDKProvider/InitializationManager/initializeState');
jest.mock('../services/SDKProvider/InitializationManager/initializeStateAsync');

describe('SDKProvider', () => {
  let provider: SDKProvider;
  const mockStream = new Duplex({
    objectMode: true,
    read() {
      // do nothing
    },
    write() {
      // do nothing
    },
  });
  const mockHandleChainChanged = handleChainChanged as jest.MockedFunction<
    typeof handleChainChanged
  >;
  const mockHandleDisconnect = handleDisconnect as jest.MockedFunction<
    typeof handleDisconnect
  >;

  const mockInitializeState = initializeState as jest.MockedFunction<
    typeof initializeState
  >;

  const mockInitializeStateAsync = initializeStateAsync as jest.MockedFunction<
    typeof initializeStateAsync
  >;

  const sdkProviderProps: SDKProviderProps = {
    connectionStream: mockStream,
    shouldSendMetadata: false,
    debug: true,
    autoRequestAccounts: false,
  };

  beforeEach(() => {
    provider = new SDKProvider(sdkProviderProps);
  });

  describe('Initialization', () => {
    it('should set debug mode correctly', () => {
      expect(provider.debug).toBe(true);
    });

    it('should set autoRequestAccounts correctly', () => {
      expect(provider.autoRequestAccounts).toBe(false);
    });
  });

  describe('forceInitializeState', () => {
    it('should call _initializeStateAsync', async () => {
      await provider.forceInitializeState();
      expect(mockInitializeStateAsync).toHaveBeenCalled();
    });
  });

  describe('_setConnected', () => {
    it('should set isConnected state to true', () => {
      provider._setConnected();
      expect(provider.getState().isConnected).toBe(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should call external handleDisconnect function with correct arguments', () => {
      provider.handleDisconnect({ terminate: true });
      expect(mockHandleDisconnect).toHaveBeenCalledWith({
        terminate: true,
        instance: provider,
      });
    });
  });

  describe('_initializeStateAsync', () => {
    it('should call initializeStateAsync with the instance', async () => {
      // @ts-ignore
      await provider._initializeStateAsync();
      expect(mockInitializeStateAsync).toHaveBeenCalledWith(provider);
    });
  });

  describe('_initializeState', () => {
    it('should call initializeState', () => {
      const initialState = {
        accounts: ['0x123'],
        chainId: '1',
        isUnlocked: true,
        networkVersion: '1',
      };
      // @ts-ignore
      provider._initializeState(initialState);
      expect(mockInitializeState).toHaveBeenCalledWith(
        provider,
        expect.any(Function),
        initialState,
      );
    });
  });

  describe('_handleChainChanged', () => {
    it('should call handleChainChanged with the correct arguments', () => {
      const chainId = '1';
      const networkVersion = '1';

      // @ts-ignore
      provider._handleChainChanged({ chainId, networkVersion });
      expect(mockHandleChainChanged).toHaveBeenCalledWith({
        instance: provider,
        chainId,
        networkVersion,
        superHandleChainChanged: expect.any(Function),
      });
    });
  });
});
