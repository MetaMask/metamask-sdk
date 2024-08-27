/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { createChannel } from './createChannel';
import { setupChannelListeners } from './setupChannelListeners';

jest.mock('./setupChannelListeners');

const mockConnect = jest.fn();
const mockEmit = jest.fn();
const mockGetMyPublicKey = jest.fn();

describe('createChannel', () => {
  let instance: SocketService;

  const mockGetKeyInfo = jest.fn();
  const spyLogger = jest.spyOn(logger, 'SocketService');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        socket: {
          connected: false,
          connect: mockConnect,
          emit: mockEmit,
        },
        context: 'testContext',
        manualDisconnect: true,
        isOriginator: false,
        channelId: '',
        keyExchange: {
          getMyPublicKey: mockGetMyPublicKey,
          getKeyInfo: mockGetKeyInfo,
        },
      },
      initSocket: jest.fn(),
      remote: { state: {} },
    } as unknown as SocketService;
  });

  it('should generate a valid UUID for the channel', async () => {
    const result = await createChannel(instance);

    expect(result.channelId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
    );
  });

  it('should connect socket if not connected', async () => {
    await createChannel(instance);

    expect(instance.state.socket?.connect).toHaveBeenCalled();
  });

  it('should setup channel listeners with correct channelId', async () => {
    const result = await createChannel(instance);

    expect(setupChannelListeners).toHaveBeenCalledWith(
      instance,
      result.channelId,
    );
  });

  it('should emit JOIN_CHANNEL event with correct parameters', async () => {
    const result = await createChannel(instance);

    expect(instance.state.socket?.emit).toHaveBeenCalledWith('join_channel', {
      channelId: instance.state.channelId,
      clientType: 'dapp',
      context: 'testContextcreateChannel',
    });

    expect(result.pubKey).toBe('');
  });

  it('should return empty string for pubKey if not available', async () => {
    mockGetMyPublicKey.mockReturnValue(undefined);
    const result = await createChannel(instance);

    expect(result.pubKey).toBe('');
  });

  it('should log debug info', async () => {
    await createChannel(instance);

    expect(spyLogger).toHaveBeenCalledWith(
      `[SocketService: createChannel()] context=${instance.state.context}`,
    );
  });
});
