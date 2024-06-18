import { DEFAULT_SESSION_TIMEOUT_MS } from '../../../config';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleFullPersistenceEvent } from './handleFullPersistenceEvent';

jest.mock('../../../utils/logger', () => ({
  logger: {
    RemoteCommunication: jest.fn(),
  },
}));

describe('handleFullPersistenceEvent', () => {
  let instance: RemoteCommunication;
  let state: any;
  const mockEmit = jest.fn();
  const mockSetKeysExchanged = jest.fn();
  const mockGetKeyInfo = jest.fn();
  const mockGetOtherPublicKey = jest.fn();
  const mockPersistChannelConfig = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      context: 'testContext',
      ready: false,
      clientsConnected: false,
      authorized: false,
      relayPersistence: false,
      communicationLayer: {
        getKeyExchange: jest.fn(() => ({
          setKeysExchanged: mockSetKeysExchanged,
          getKeyInfo: mockGetKeyInfo,
          getOtherPublicKey: mockGetOtherPublicKey,
        })),
      },
      channelConfig: null,
      channelId: 'testChannelId',
      storageManager: {
        persistChannelConfig: mockPersistChannelConfig,
      },
    };

    instance = {
      state,
      emit: mockEmit,
    } as unknown as RemoteCommunication;
  });

  it('logs the context', async () => {
    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(logger.RemoteCommunication).toHaveBeenCalledWith(
      `[RemoteCommunication: handleFullPersistenceEvent()] context=testContext`,
    );
  });

  it('updates the state to ready, clientsConnected, authorized, and relayPersistence', async () => {
    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(instance.state.ready).toBe(true);
    expect(instance.state.clientsConnected).toBe(true);
    expect(instance.state.authorized).toBe(true);
    expect(instance.state.relayPersistence).toBe(true);
  });

  it('sets keys exchanged', async () => {
    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(mockSetKeysExchanged).toHaveBeenCalledWith(true);
  });

  it('emits KEYS_EXCHANGED, AUTHORIZED, CLIENTS_READY, and CHANNEL_PERSISTENCE events', async () => {
    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(mockEmit).toHaveBeenCalledWith(EventType.KEYS_EXCHANGED, {
      keysExchanged: true,
      isOriginator: true,
    });
    expect(mockEmit).toHaveBeenCalledWith(EventType.AUTHORIZED);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CLIENTS_READY);
    expect(mockEmit).toHaveBeenCalledWith(EventType.CHANNEL_PERSISTENCE);
  });

  it('updates channelConfig and persists it', async () => {
    const localKey = 'localKey';
    const otherKey = 'otherKey';

    mockGetKeyInfo.mockReturnValue({ ecies: { private: localKey } });
    mockGetOtherPublicKey.mockReturnValue(otherKey);

    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(state.channelConfig).toStrictEqual({
      localKey,
      otherKey,
      channelId: 'testChannelId',
      validUntil: DEFAULT_SESSION_TIMEOUT_MS,
      relayPersistence: true,
    });

    expect(mockPersistChannelConfig).toHaveBeenCalledWith(state.channelConfig);
  });

  it('handles errors during persistence gracefully', async () => {
    mockPersistChannelConfig.mockRejectedValueOnce(
      new Error('Persistence error'),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const handler = handleFullPersistenceEvent(instance);
    await handler();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error persisting channel config',
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});
