import { EventType } from '@metamask/sdk-communication-layer';
import { STORAGE_PROVIDER_TYPE } from '../../../config';
import { MetaMaskSDK } from '../../../sdk';
import { PROVIDER_UPDATE_TYPE } from '../../../types/ProviderUpdateType';
import { terminate } from './terminate';

describe('terminate', () => {
  let instance: MetaMaskSDK;
  const mockIsMetaMaskMobileWebView = jest.fn();
  const mockDisconnect = jest.fn();
  const mockEmit = jest.fn();

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  let mockEthereum = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMetaMaskMobileWebView.mockReturnValue(false);
    mockEthereum = {};

    global.localStorage = localStorageMock as any;
    global.window = { ethereum: mockEthereum } as any;

    instance = {
      platformManager: { isMetaMaskMobileWebView: mockIsMetaMaskMobileWebView },
      extensionActive: false,
      options: {},
      sdkProvider: {},
      activeProvider: {},
      debug: false,
      emit: mockEmit,
      remoteConnection: { disconnect: mockDisconnect },
      _initialized: true,
    } as unknown as MetaMaskSDK;
  });

  describe('when in MetaMask Mobile WebView', () => {
    beforeEach(() => mockIsMetaMaskMobileWebView.mockReturnValue(true));

    it('should do nothing', () => {
      terminate(instance);
      expect(mockDisconnect).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('when outside MetaMask Mobile WebView', () => {
    beforeEach(() => mockIsMetaMaskMobileWebView.mockReturnValue(false));

    describe('when Extension is Active', () => {
      beforeEach(() => {
        instance.extensionActive = true;
      });

      it('should remove extension provider', () => {
        terminate(instance);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          STORAGE_PROVIDER_TYPE,
        );
      });

      it('should switch back to default provider', () => {
        terminate(instance);
        expect(instance.activeProvider).toBe(instance.sdkProvider);
        expect((global.window as any).ethereum).toBe(instance.activeProvider);
      });

      it('should set extensionActive to false', () => {
        terminate(instance);
        expect(instance.extensionActive).toBe(false);
      });

      it('should emit PROVIDER_UPDATE with TERMINATE', () => {
        terminate(instance);
        expect(mockEmit).toHaveBeenCalledWith(
          EventType.PROVIDER_UPDATE,
          PROVIDER_UPDATE_TYPE.TERMINATE,
        );
      });

      it('should not switch providers if extensionOnly option is true', () => {
        instance.options.extensionOnly = true;
        terminate(instance);
        expect(mockEmit).not.toHaveBeenCalled();
      });
    });

    describe('when Extension is Not Active', () => {
      beforeEach(() => {
        instance.extensionActive = false;
      });

      it('should emit PROVIDER_UPDATE with TERMINATE', () => {
        terminate(instance);
        expect(mockEmit).toHaveBeenCalledWith(
          EventType.PROVIDER_UPDATE,
          PROVIDER_UPDATE_TYPE.TERMINATE,
        );
      });

      it('should log debug messages when debug is true', () => {
        instance.debug = true;
        const consoleDebugSpy = jest
          .spyOn(console, 'debug')
          .mockImplementation();
        terminate(instance);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          'SDK::terminate()',
          instance.remoteConnection,
        );
      });

      it('should disconnect remote connection', () => {
        terminate(instance);
        expect(mockDisconnect).toHaveBeenCalledWith({
          terminate: true,
          sendMessage: true,
        });
      });

      it('should set _initialized to false', () => {
        terminate(instance);
        expect(instance._initialized).toBe(false);
      });
    });
  });
});
