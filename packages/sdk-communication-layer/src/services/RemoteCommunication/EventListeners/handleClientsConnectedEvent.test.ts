import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerPreference } from '../../../types/CommunicationLayerPreference';
import { EventType } from '../../../types/EventType';
import { SendAnalytics } from '../../../Analytics';
import packageJson from '../../../../package.json';
import { handleClientsConnectedEvent } from './handleClientsConnectedEvent';

jest.mock('../../../Analytics', () => ({
  SendAnalytics: jest.fn().mockResolvedValue(undefined),
}));

describe('handleClientsConnectedEvent', () => {
  let instance: RemoteCommunication;
  const mockEmit = jest.fn();
  const mockGetKeyInfo = jest.fn();

  // Mock console.debug and console.error
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
        sdkVersion: '1.0',
        originatorInfo: {
          someKey: 'someValue',
        },
        communicationServerUrl: 'http://mock-url.com',
      },
      emit: mockEmit,
    } as unknown as RemoteCommunication;

    mockGetKeyInfo.mockReturnValue({
      keysExchanged: true,
    });
  });

  it('should log the event details if debugging is enabled', () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    ); // You might need to specify the correct preference here
    handler();
    expect(console.debug).toHaveBeenCalledWith(
      `RemoteCommunication::on 'clients_connected' channel=testChannel keysExchanged=true`,
    );
  });

  it('should send analytics data if analytics tracking is enabled', async () => {
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    await handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'testChannel',
        commLayer: CommunicationLayerPreference.SOCKET,
        sdkVersion: '1.0',
        commLayerVersion: packageJson.version,
      }),
      'http://mock-url.com',
    );
  });

  it('should update the state of the instance correctly', () => {
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

  it('should handle analytics send error gracefully', async () => {
    (SendAnalytics as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to send analytics'),
    );
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    await handler();
    expect(console.error).toHaveBeenCalledWith(
      'Cannot send analytics',
      expect.any(Error),
    );
  });

  it('should not log event details if debugging is disabled', () => {
    instance.state.debug = false;
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it('should not send analytics data if analytics tracking is disabled', async () => {
    instance.state.analytics = false;
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    await handler();
    expect(SendAnalytics).not.toHaveBeenCalled();
  });

  it('should handle missing channelId gracefully', async () => {
    delete instance.state.channelId;
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    await handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ id: '' }),
      'http://mock-url.com',
    );
  });

  it('should handle missing communicationLayer gracefully', () => {
    delete instance.state.communicationLayer;
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    handler();
    // No errors should be thrown
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_CONNECTED);
  });

  it('should send analytics data correctly if originatorInfo is missing', async () => {
    delete instance.state.originatorInfo;
    const handler = handleClientsConnectedEvent(
      instance,
      CommunicationLayerPreference.SOCKET,
    );
    await handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        commLayer: CommunicationLayerPreference.SOCKET,
        sdkVersion: '1.0',
        commLayerVersion: packageJson.version,
      }),
      'http://mock-url.com',
    );
  });
});
