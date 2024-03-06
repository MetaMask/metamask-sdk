import { Ethereum } from '../../Ethereum';
import { reconnectWithModalOTP } from '../ModalManager/reconnectWithModalOTP';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import * as loggerModule from '../../../utils/logger';
import { connectWithDeeplink } from './connectWithDeeplink';
import { connectWithModalInstaller } from './connectWithModalInstaller';
import { startConnection } from './startConnection';

jest.mock('../../Ethereum', () => ({
  Ethereum: {
    getProvider: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  },
}));

jest.mock('./connectWithDeeplink', () => ({
  connectWithDeeplink: jest.fn(),
}));

jest.mock('./connectWithModalInstaller', () => ({
  connectWithModalInstaller: jest.fn(),
}));

jest.mock('../ModalManager/reconnectWithModalOTP', () => ({
  reconnectWithModalOTP: jest.fn(),
}));

describe('startConnection', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;

  const spyLogger = jest.spyOn(loggerModule, 'logger');
  const mockOriginatorSessionConnect = jest.fn();
  const mockGenerateChannelIdConnect = jest.fn();
  const mockGetKeyInfo = jest.fn();
  const mockIsSecure = jest.fn();
  const mockReconnectWithModalOTP = reconnectWithModalOTP as jest.Mock;
  const mockConnectWithDeeplink = connectWithDeeplink as jest.Mock;
  const mockConnectWithModalInstaller = connectWithModalInstaller as jest.Mock;

  beforeEach(() => {
    state = {
      connector: {
        originatorSessionConnect: mockOriginatorSessionConnect,
        getKeyInfo: mockGetKeyInfo,
        generateChannelIdConnect: mockGenerateChannelIdConnect,
      },
      developerMode: false,
      platformManager: {
        isSecure: mockIsSecure,
      },
      communicationLayerPreference: 'mock_comm',
      authorized: true,
    } as unknown as RemoteConnectionState;

    options = {
      dappMetadata: {},
    } as unknown as RemoteConnectionProps;

    jest.spyOn(console, 'debug').mockImplementation(() => {
      // do nothing
    });

    mockGetKeyInfo.mockReturnValue({
      ecies: { public: 'public_key' },
    });
  });

  it('should throw an error if no connector is defined', async () => {
    state.connector = undefined;

    await expect(startConnection(state, options)).rejects.toThrow(
      'no connector defined',
    );
  });

  it('should log debug info', async () => {
    mockOriginatorSessionConnect.mockResolvedValue({});

    await startConnection(state, options);

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should establish socket connection by emitting connecting', async () => {
    await startConnection(state, options);

    expect(Ethereum.getProvider().emit).toHaveBeenCalledWith('connecting');
  });

  it('should call connectWithDeeplink when platform is secure', async () => {
    mockIsSecure.mockReturnValue(true);

    await startConnection(state, options);

    expect(mockConnectWithDeeplink).toHaveBeenCalledWith(
      state,
      expect.any(String),
    );
  });

  it('should call reconnectWithModalOTP when channelConfig lastActive is true and isSecure is false', async () => {
    const mockChannelConfig = {
      lastActive: true,
    };

    mockOriginatorSessionConnect.mockResolvedValue(mockChannelConfig);

    mockIsSecure.mockReturnValue(false);

    await startConnection(state, options);

    expect(mockReconnectWithModalOTP).toHaveBeenCalledWith(
      state,
      options,
      mockChannelConfig,
    );
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
});
