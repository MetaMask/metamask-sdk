import { SendAnalytics } from '@metamask/analytics-client';
import { TrackingEvents } from '@metamask/sdk-types';
import packageJson from '../../../../package.json';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleClientsConnectedEvent } from './handleClientsConnectedEvent';

jest.mock('@metamask/analytics-client', () => ({
  SendAnalytics: jest.fn().mockResolvedValue(undefined),
}));

// Disabled while checking externalizing analytics server.
describe.skip('handleClientsConnectedEvent', () => {
  let instance: RemoteCommunication;
  const mockEmit = jest.fn();
  const mockGetKeyInfo = jest.fn();

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        context: 'mockContext',
        channelId: 'testChannel',
        analytics: true,
        sdkVersion: '1.0',
        walletInfo: { version: '1.0' },
        communicationLayer: {
          getKeyInfo: mockGetKeyInfo,
        },
        originatorInfo: {
          someKey: 'someValue',
        },
        analyticsServerUrl: 'http://mock-url.com',
        isOriginator: false,
      },
      emit: mockEmit,
    } as unknown as RemoteCommunication;

    mockGetKeyInfo.mockReturnValue({
      keysExchanged: true,
    });
  });

  it('should log the event details', () => {
    const handler = handleClientsConnectedEvent(instance);
    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[RemoteCommunication: handleClientsConnectedEvent()] on 'clients_connected' channel=testChannel keysExchanged=true",
    );
  });

  it('should send analytics data if analytics tracking is enabled', async () => {
    const handler = handleClientsConnectedEvent(instance);
    await handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TrackingEvents.RECONNECT,
        id: 'testChannel',
        sdkVersion: '1.0',
        commLayerVersion: packageJson.version,
        walletVersion: '1.0',
        someKey: 'someValue',
      }),
      'http://mock-url.com',
    );
  });

  it('should update the state of the instance correctly', () => {
    const handler = handleClientsConnectedEvent(instance);
    handler();
    expect(instance.state.clientsConnected).toBe(true);
    expect(instance.state.originatorInfoSent).toBe(false);
  });

  it('should emit CLIENTS_CONNECTED event', () => {
    const handler = handleClientsConnectedEvent(instance);
    handler();
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_CONNECTED);
  });

  it('should handle analytics send error gracefully', async () => {
    (SendAnalytics as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to send analytics'),
    );
    const handler = handleClientsConnectedEvent(instance);
    await handler();
    expect(console.error).toHaveBeenCalledWith(
      'Cannot send analytics',
      expect.any(Error),
    );
  });

  it('should not send analytics data if analytics tracking is disabled', async () => {
    instance.state.analytics = false;
    const handler = handleClientsConnectedEvent(instance);
    await handler();
    expect(SendAnalytics).not.toHaveBeenCalled();
  });

  it('should handle missing channelId gracefully', async () => {
    delete instance.state.channelId;
    const handler = handleClientsConnectedEvent(instance);
    await handler();
    expect(SendAnalytics).not.toHaveBeenCalled();
  });

  it('should handle missing communicationLayer gracefully', () => {
    delete instance.state.communicationLayer;
    const handler = handleClientsConnectedEvent(instance);
    handler();
    // No errors should be thrown
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_CONNECTED);
  });

  it('should send analytics data correctly if originatorInfo is missing', async () => {
    delete instance.state.originatorInfo;
    const handler = handleClientsConnectedEvent(instance);
    await handler();
    expect(SendAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TrackingEvents.RECONNECT,
        id: 'testChannel',
        sdkVersion: '1.0',
        commLayerVersion: packageJson.version,
        walletVersion: '1.0',
      }),
      'http://mock-url.com',
    );
    const receivedParams = (SendAnalytics as jest.Mock).mock.calls[0][0];
    expect(receivedParams).not.toHaveProperty('originatorInfo');
    expect(receivedParams).not.toHaveProperty('someKey');
  });
});
