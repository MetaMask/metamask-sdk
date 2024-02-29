import { SendAnalytics } from '../../../Analytics';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleClientsConnectedEvent } from './handleClientsConnectedEvent';

jest.mock('../../../../package.json', () => ({
  version: 'mockVersion',
}));

jest.mock('../../../Analytics', () => ({
  SendAnalytics: jest.fn(() => Promise.resolve()),
}));

describe('handleClientsConnectedEvent', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  const mockEmit = jest.fn();
  const mockGetKeyInfo = jest.fn();

  jest.spyOn(console, 'debug').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        channelId: 'testChannel',
        analytics: true,
        communicationLayer: {
          getKeyInfo: mockGetKeyInfo,
        },
        sdkVersion: 'mockSdkVersion',
        originatorInfo: {},
        communicationServerUrl: 'mockUrl',
      },
      emit: mockEmit,
    } as unknown as RemoteCommunication;

    mockGetKeyInfo.mockReturnValue({
      keysExchanged: true,
    });
  });

  it('should log event details', () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    expect(spyLogger).toHaveBeenCalledWith(
      "[RemoteCommunication: handleClientsConnectedEvent()] on 'clients_connected' channel=testChannel keysExchanged=true",
    );
  });

  it('should send analytics data when analytics tracking is enabled', () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      {
        id: 'testChannel',
        event: expect.any(String),
        commLayer: CommunicationLayerPreference.SOCKET,
        sdkVersion: 'mockSdkVersion',
        walletVersion: undefined,
        commLayerVersion: 'mockVersion',
      },
      'mockUrl',
    );
  });

  it('should update state correctly', () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    expect(instance.state.clientsConnected).toBe(true);
    expect(instance.state.originatorInfoSent).toBe(false);
  });

  it('should emit CLIENTS_CONNECTED event', () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_CONNECTED);
  });
});
