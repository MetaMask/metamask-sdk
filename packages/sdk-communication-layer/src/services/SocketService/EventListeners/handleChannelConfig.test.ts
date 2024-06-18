import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleChannelConfig } from './handleChannelConfig';

jest.mock('../../../utils/logger', () => ({
  logger: {
    SocketService: jest.fn(),
  },
}));

describe('handleChannelConfig', () => {
  let instance: SocketService;
  let state: any;
  let remote: any;
  const mockEmit = jest.fn();
  const mockSetKeysExchanged = jest.fn();
  const mockPersistChannelConfig = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      isOriginator: false,
      keyExchange: {
        setKeysExchanged: mockSetKeysExchanged,
      },
    };

    remote = {
      state: {
        relayPersistence: false,
        channelConfig: null,
        storageManager: {
          persistChannelConfig: mockPersistChannelConfig,
        },
      },
      emit: mockEmit,
    };

    instance = {
      state,
      remote,
    } as unknown as SocketService;
  });

  it('logs the relay persistence update', async () => {
    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(logger.SocketService).toHaveBeenCalledWith(
      `[SocketService: handleChannelConfig()] update relayPersistence on 'config-testChannelId'`,
      { persistence: true },
    );
  });

  it('updates relayPersistence state and emits CHANNEL_PERSISTENCE event', async () => {
    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(instance.remote.state.relayPersistence).toBe(true);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_PERSISTENCE);
  });

  it('sets keys exchanged', async () => {
    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(mockSetKeysExchanged).toHaveBeenCalledWith(true);
  });

  it('does not persist channel config if not originator', async () => {
    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(mockPersistChannelConfig).not.toHaveBeenCalled();
  });

  it('persists channel config if originator and config conditions are met', async () => {
    state.isOriginator = true;
    remote.state.channelConfig = { relayPersistence: false };

    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(remote.state.channelConfig.relayPersistence).toBe(true);
    expect(mockPersistChannelConfig).toHaveBeenCalledWith(
      remote.state.channelConfig,
    );
  });

  it('does not persist channel config if relayPersistence is already true', async () => {
    state.isOriginator = true;
    remote.state.channelConfig = { relayPersistence: true };

    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(mockPersistChannelConfig).not.toHaveBeenCalled();
  });

  it('handles null storageManager gracefully', async () => {
    state.isOriginator = true;
    remote.state.channelConfig = { relayPersistence: false };
    remote.state.storageManager = null;

    const handler = handleChannelConfig(instance, 'testChannelId');
    await handler({ persistence: true });

    expect(remote.state.channelConfig.relayPersistence).toBe(true);
  });
});
