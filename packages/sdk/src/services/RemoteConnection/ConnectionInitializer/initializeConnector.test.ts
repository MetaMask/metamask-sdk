import {
  CommunicationLayerPreference,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';
import packageJson from '../../../../package.json';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { initializeConnector } from './initializeConnector';

jest.mock('@metamask/sdk-communication-layer');

describe('initializeConnector', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;
  const mockRemoteCommunication = RemoteCommunication as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      developerMode: false,
      connector: null,
    } as unknown as RemoteConnectionState;

    options = {
      dappMetadata: {},
      communicationLayerPreference: CommunicationLayerPreference.SOCKET,
      transports: [],
      _source: 'source',
      enableDebug: true,
      platformManager: {
        getPlatformType: jest.fn().mockReturnValue('platformType'),
      },
    } as unknown as RemoteConnectionProps;
  });

  it('should initialize the RemoteCommunication connector with provided options', () => {
    initializeConnector(state, options);

    expect(mockRemoteCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        platformType: 'platformType',
        communicationLayerPreference: CommunicationLayerPreference.SOCKET,
        sdkVersion: packageJson.version,
        context: 'dapp',
      }),
    );
  });

  it('should run background timer when timer is provided', () => {
    const mockStopBackgroundTimer = jest.fn();
    const mockRunBackgroundTimer = jest.fn();
    options.timer = {
      stopBackgroundTimer: mockStopBackgroundTimer,
      runBackgroundTimer: mockRunBackgroundTimer,
    };

    initializeConnector(state, options);

    expect(mockStopBackgroundTimer).toHaveBeenCalled();
    expect(mockRunBackgroundTimer).toHaveBeenCalledWith(
      expect.any(Function),
      10000,
    );
  });

  it('should handle missing dappMetadata by setting a default source', () => {
    initializeConnector(state, options);

    expect(mockRemoteCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        dappMetadata: {
          source: options._source,
        },
      }),
    );
  });

  it('should print debug messages when developerMode is true', () => {
    state.developerMode = true;
    jest.spyOn(console, 'debug').mockImplementation();

    initializeConnector(state, options);

    expect(console.debug).toHaveBeenCalled();
  });

  it('should handle when platformManager.getPlatformType() returns undefined', () => {
    options.platformManager = {
      getPlatformType: jest.fn().mockReturnValue(undefined),
    } as unknown as RemoteConnectionProps['platformManager'];

    initializeConnector(state, options);

    expect(mockRemoteCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        platformType: undefined,
      }),
    );
  });
});
