import { SendAnalytics } from '@metamask/analytics-client';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleClientsDisconnectedEvent } from './handleClientsDisconnectedEvent';

jest.mock('../../../../package.json', () => ({
  version: 'mockVersion',
}));

jest.mock('@metamask/analytics-client', () => ({
  SendAnalytics: jest.fn(() => Promise.resolve()),
}));

describe('handleClientsDisconnectedEvent', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  const mockEmit = jest.fn();
  const mockSetConnectionStatus = jest.fn();

  jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        context: 'testContext',
        relayPersistence: false,
        clientsConnected: true,
        ready: true,
        authorized: true,
        channelId: 'testChannel',
        analytics: true,
        sdkVersion: 'mockSdkVersion',
        walletInfo: { version: 'mockWalletVersion' },
        communicationServerUrl: 'mockUrl',
      },
      emit: mockEmit,
      setConnectionStatus: mockSetConnectionStatus,
    } as unknown as RemoteCommunication;
  });

  it('should log event details', () => {
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(spyLogger).toHaveBeenCalledWith(
      `[RemoteCommunication: handleClientsDisconnectedEvent()] context=testContext on 'clients_disconnected' channelId=testChannel`,
    );
  });

  it('should update state correctly when relay persistence is not available', () => {
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(instance.state.clientsConnected).toBe(false);
    expect(instance.state.ready).toBe(false);
    expect(instance.state.authorized).toBe(false);
  });

  it('should not update state when relay persistence is available', () => {
    instance.state.relayPersistence = true;
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(instance.state.clientsConnected).toBe(true);
    expect(instance.state.ready).toBe(true);
    expect(instance.state.authorized).toBe(true);
  });

  it('should emit CLIENTS_DISCONNECTED event', () => {
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(mockEmit).toHaveBeenCalledWith(
      EventType.CLIENTS_DISCONNECTED,
      'testChannel',
    );
  });

  it('should set connection status to DISCONNECTED', () => {
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.DISCONNECTED,
    );
  });

  it('should not send analytics data even when analytics tracking is enabled and channelId is available', () => {
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(SendAnalytics).not.toHaveBeenCalled();
  });

  it('should not attempt to send analytics data', async () => {
    (SendAnalytics as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );
    const handler = handleClientsDisconnectedEvent(instance);
    handler('testChannel');
    expect(SendAnalytics).not.toHaveBeenCalled();
    await new Promise(process.nextTick);
    expect(console.error).not.toHaveBeenCalled();
  });
});
