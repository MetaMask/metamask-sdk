import { base64Encode } from '../../../utils/base64';
import * as loggerModule from '../../../utils/logger';
import { Ethereum } from '../../Ethereum';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { connectWithDeeplink } from './connectWithDeeplink';
import { connectWithModalInstaller } from './connectWithModalInstaller';
import { startConnection } from './startConnection';

// Mock the entire module that contains the base64Encode function
jest.mock('../../../utils/base64', () => ({
  base64Encode: jest.fn((str) => Buffer.from(str).toString('base64')),
}));

jest.mock('../../Ethereum', () => ({
  Ethereum: {
    getProvider: jest.fn().mockReturnValue({
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn((event, callback) => {
        if (event === 'AUTHORIZED') {
          console.log('Mock AUTHORIZED event emitted');
          callback();
        }
      }),
    }),
  },
}));

jest.mock('./connectWithDeeplink', () => ({
  connectWithDeeplink: jest.fn(async () => {
    return Promise.resolve();
  }),
}));

jest.mock('./connectWithModalInstaller', () => ({
  connectWithModalInstaller: jest.fn(),
}));

describe('startConnection', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;

  const spyLogger = jest.spyOn(loggerModule, 'logger');
  const mockOriginatorSessionConnect = jest.fn();
  const mockGenerateChannelIdConnect = jest.fn();
  const mockGetKeyInfo = jest.fn();
  const mockIsSecure = jest.fn();
  const mockGetPlatformType = jest.fn();
  const mockConnectWithDeeplink = connectWithDeeplink as jest.Mock;
  const mockConnectWithModalInstaller = connectWithModalInstaller as jest.Mock;

  beforeEach(() => {
    const mockConnector = {
      originatorSessionConnect: mockOriginatorSessionConnect,
      getKeyInfo: mockGetKeyInfo,
      generateChannelIdConnect: mockGenerateChannelIdConnect,
      isConnected: jest.fn(() => true),
      isAuthorized: jest.fn(() => true),
      on: jest.fn(),
      emit: jest.fn(),
      once: jest.fn(),
      connectToChannel: jest.fn(),
      state: {
        storageManager: {
          persistChannelConfig: jest.fn(),
        },
      },
      getRPCMethodTracker: jest.fn().mockReturnValue({}),
    };

    state = {
      connector: mockConnector,
      developerMode: false,
      platformManager: {
        isSecure: mockIsSecure,
        getPlatformType: mockGetPlatformType,
      },
      communicationLayerPreference: 'mock_comm',
      authorized: true,
      listeners: [],
    } as unknown as RemoteConnectionState;

    options = {
      dappMetadata: {
        name: 'Test Dapp',
        url: 'https://testdapp.com',
        iconUrl: 'https://testdapp.com/icon.png',
      },
      platformManager: {
        getPlatformType: mockGetPlatformType,
      },
    } as unknown as RemoteConnectionProps;

    jest.spyOn(console, 'debug').mockImplementation(() => {
      // do nothing
    });

    mockGetKeyInfo.mockReturnValue({
      ecies: { public: 'public_key' },
    });

    mockGenerateChannelIdConnect.mockResolvedValue({
      channelId: 'test_channel_id',
      pubKey: 'test_pub_key',
      privKey: 'test_priv_key',
    });

    mockGetPlatformType.mockReturnValue('test_platform');
  });

  it('should throw an error if no connector is defined', async () => {
    state.connector = undefined;

    await expect(startConnection(state, options)).rejects.toThrow(
      'communication layer not initialized',
    );
  });

  it('should log debug info', async () => {
    mockOriginatorSessionConnect.mockResolvedValue({});

    await startConnection(state, options);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should establish socket connection by emitting connecting', async () => {
    mockOriginatorSessionConnect.mockResolvedValue({});

    await startConnection(state, options);

    expect(Ethereum.getProvider().emit).toHaveBeenCalledWith('connecting');
  });

  it('should call connectWithDeeplink when platform is secure', async () => {
    mockIsSecure.mockReturnValue(true);
    mockOriginatorSessionConnect.mockResolvedValue({});

    await startConnection(state, options);

    expect(mockConnectWithDeeplink).toHaveBeenCalled();
  });

  it('should call connectWithModalInstaller when platform is not secure and channelConfig does not have lastActive', async () => {
    mockIsSecure.mockReturnValue(false);
    mockOriginatorSessionConnect.mockResolvedValue({});

    await startConnection(state, options);

    expect(mockConnectWithModalInstaller).toHaveBeenCalledWith(
      state,
      options,
      expect.any(String),
    );
  });

  describe('startConnection with connectWith', () => {
    it('should correctly encode and append connectWith RPC call to linkParams', async () => {
      const connectWith = {
        method: 'eth_sendTransaction',
        params: [{ from: '0x123', to: '0x456', value: '0x789' }],
        id: '123',
      };

      await startConnection(state, options, { connectWith });

      expect(mockConnectWithModalInstaller).toHaveBeenCalledWith(
        state,
        options,
        expect.stringContaining(`rpc=`),
      );
    });

    it('should call base64Encode with correct connectWith RPC call', async () => {
      const connectWith = {
        method: 'personal_sign',
        params: ['0xabcdef', '0x123456'],
        id: '123',
      };

      await startConnection(state, options, { connectWith });

      // Ensure the base64Encode was called with originatorInfo first
      expect(base64Encode).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('"url":'),
      );
    });

    it('should handle connectWith in a secure environment with deeplink', async () => {
      mockIsSecure.mockReturnValue(true);
      const connectWith = {
        method: 'eth_sign',
        params: ['0x123456', '0xabcdef'],
        id: '123',
      };

      await startConnection(state, options, { connectWith });

      expect(mockConnectWithDeeplink).toHaveBeenCalledWith(
        state,
        expect.stringContaining(`rpc=`),
      );
    });

    it('should handle connectWith in a non-secure environment with modal installer', async () => {
      mockIsSecure.mockReturnValue(false);
      const connectWith = {
        method: 'eth_sign',
        params: ['0x123456', '0xabcdef'],
        id: '123',
      };

      await startConnection(state, options, { connectWith });

      expect(mockConnectWithModalInstaller).toHaveBeenCalledWith(
        state,
        options,
        expect.stringContaining(`rpc=`),
      );
    });
  });

  describe('hideReturnToAppNotification URL parameter', () => {
    beforeEach(() => {
      mockIsSecure.mockReturnValue(true);
    });

    it('should pass hr=1 when hideReturnToAppNotification is true', async () => {
      state.hideReturnToAppNotification = true;

      await startConnection(state, options);

      // Vérifier que le QR code link contient hr=1
      expect(state.qrcodeLink).toContain('hr=1');
    });

    it('should pass hr=0 when hideReturnToAppNotification is false', async () => {
      state.hideReturnToAppNotification = false;

      await startConnection(state, options);

      // Vérifier que le QR code link contient hr=0
      expect(state.qrcodeLink).toContain('hr=0');
    });

    it('should pass hr=0 when hideReturnToAppNotification is undefined', async () => {
      state.hideReturnToAppNotification = undefined;

      await startConnection(state, options);

      // Vérifier que le QR code link contient hr=0
      expect(state.qrcodeLink).toContain('hr=0');
    });

    it('should include hr parameter in connectWith scenarios', async () => {
      mockIsSecure.mockReturnValue(false);
      state.hideReturnToAppNotification = true;
      const connectWith = {
        method: 'eth_sign',
        params: ['0x123456', '0xabcdef'],
        id: '123',
      };

      await startConnection(state, options, { connectWith });

      expect(mockConnectWithModalInstaller).toHaveBeenCalledWith(
        state,
        options,
        expect.stringContaining('hr=1'),
      );
    });
  });
});
