import { Ethereum } from '../Ethereum'; // Adjust the import based on your project structure
import { RemoteCommunicationPostMessageStream } from '../../PostMessageStream/RemoteCommunicationPostMessageStream'; // Adjust the import based on your project structure
import { METHODS_TO_REDIRECT } from '../../config';
import * as loggerModule from '../../utils/logger'; // Adjust the import based on your project structure
import { write } from './write'; // Adjust the import based on your project structure
import { extractMethod } from './extractMethod';

jest.mock('./extractMethod');
jest.mock('../Ethereum');

describe('write function', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');
  const mockExtractMethod = extractMethod as jest.Mock;
  const mockEthereum = Ethereum.getProvider as jest.Mock;
  const mockIsReady = jest.fn();
  const mockIsConnected = jest.fn();
  const mockIsPaused = jest.fn();
  const mockGetChannelId = jest.fn();
  const mockIsAuthorized = jest.fn();
  const mockSendMessage = jest.fn(
    () =>
      new Promise((resolve) => {
        resolve('some_response');
      }),
  );
  const mockGetKeyInfo = jest.fn();
  const mockIsSecure = jest.fn();
  const mockOpenDeeplink = jest.fn();
  const isProviderConnected = jest.fn();

  let mockRemoteCommunicationPostMessageStream = {
    state: {
      remote: {
        isReady: mockIsReady,
        isConnected: mockIsConnected,
        isPaused: mockIsPaused,
        getChannelId: mockGetChannelId,
        isAuthorized: mockIsAuthorized,
        sendMessage: mockSendMessage,
        getKeyInfo: mockGetKeyInfo,
      },
      platformManager: {
        isSecure: mockIsSecure,
        openDeeplink: mockOpenDeeplink,
      },
      debug: false,
    },
  } as unknown as jest.Mocked<RemoteCommunicationPostMessageStream>;

  let callback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    callback = jest.fn();

    mockEthereum.mockReturnValue({
      isConnected: isProviderConnected,
    });

    mockExtractMethod.mockReturnValue({
      method: 'metamask_getProviderState',
    });

    mockRemoteCommunicationPostMessageStream = {
      state: {
        remote: {
          isReady: mockIsReady,
          isConnected: mockIsConnected,
          isPaused: mockIsPaused,
          getChannelId: mockGetChannelId,
          isAuthorized: mockIsAuthorized,
          sendMessage: mockSendMessage,
          getKeyInfo: mockGetKeyInfo,
        },
        platformManager: {
          isSecure: mockIsSecure,
          openDeeplink: mockOpenDeeplink,
        },
        debug: false,
      },
    } as unknown as jest.Mocked<RemoteCommunicationPostMessageStream>;
  });

  describe('When No Channel ID', () => {
    it('should call the callback immediately if channelId is undefined', async () => {
      mockGetChannelId.mockReturnValue(undefined);

      await write(
        mockRemoteCommunicationPostMessageStream,
        {},
        'utf8',
        callback,
      );

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith();
    });

    it('should log when method is not METAMASK_GETPROVIDERSTATE', async () => {
      mockExtractMethod.mockReturnValue({});

      mockGetChannelId.mockReturnValue(undefined);

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_other_method' },
        'utf8',
        callback,
      );

      expect(spyLogger).toHaveBeenCalledWith(
        '[RCPMS: write()] Invalid channel id -- undefined',
      );
    });
  });

  describe('Connection Status', () => {
    beforeEach(() => {
      mockIsSecure.mockReturnValue(true);
    });

    it('should call the callback and not send a message if neither socketConnected nor ready', async () => {
      mockIsConnected.mockReturnValue(false);
      mockIsReady.mockReturnValue(false);

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(callback).toHaveBeenCalledWith();
      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should warn if ready is true but socketConnected is false', async () => {
      mockIsReady.mockReturnValue(true);
      mockIsConnected.mockReturnValue(false);
      mockGetChannelId.mockReturnValue('some_channel_id');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[RCPMS: _write()] invalid socket status -- shouldn't happen`,
      );
    });

    it('should debug log if both ready and socketConnected are true', async () => {
      mockIsReady.mockReturnValue(true);
      mockIsConnected.mockReturnValue(true);

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(spyLogger).toHaveBeenCalledWith(
        `[RCPMS: _write()] method metamask_getProviderState doesn't need redirect.`,
      );
    });
  });

  describe('Redirect Links and Paused State', () => {
    beforeEach(() => {
      mockIsReady.mockReturnValue(true);
      mockIsConnected.mockReturnValue(true);
      mockIsAuthorized.mockReturnValue(true);
      mockIsSecure.mockReturnValue(true);
    });

    it('should redirect if method exists in METHODS_TO_REDIRECT', async () => {
      mockGetChannelId.mockReturnValue('some_channel_id');
      mockExtractMethod.mockReturnValue({
        method: Object.keys(METHODS_TO_REDIRECT)[0],
      });

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(mockOpenDeeplink).toHaveBeenCalledWith(
        'https://metamask.app.link/connect?channelId=some_channel_id&pubkey=&comm=socket&t=d',
        'metamask://connect?channelId=some_channel_id&pubkey=&comm=socket&t=d',
        '_self',
      );
    });

    it('should create a deeplink if remote is paused', async () => {
      mockIsPaused.mockReturnValue(true);
      mockGetChannelId.mockReturnValue('some_channel_id');

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(mockOpenDeeplink).toHaveBeenCalledWith(
        'https://metamask.app.link/connect?redirect=true&channelId=some_channel_id&pubkey=&comm=socket&t=d',
        'metamask://connect?redirect=true&channelId=some_channel_id&pubkey=&comm=socket&t=d',
        '_self',
      );
    });
  });

  describe('Callbacks and Logging', () => {
    it('should call the callback once if everything is fine', async () => {
      mockIsReady.mockReturnValue(true);
      mockIsConnected.mockReturnValue(true);

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith();
    });

    it('should log debug messages if debug is enabled', async () => {
      mockIsReady.mockReturnValue(true);
      mockIsConnected.mockReturnValue(true);

      await write(
        mockRemoteCommunicationPostMessageStream,
        { jsonrpc: '2.0', method: 'some_method' },
        'utf8',
        callback,
      );

      expect(spyLogger).toHaveBeenCalled();
    });
  });
});
