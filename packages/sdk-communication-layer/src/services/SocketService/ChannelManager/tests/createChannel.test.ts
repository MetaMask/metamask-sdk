/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SocketService } from '../../../../SocketService';
import { createChannel } from '../createChannel';
import { setupChannelListeners } from '../setupChannelListeners';

jest.mock('../setupChannelListeners');

const mockConnect = jest.fn();
const mockEmit = jest.fn();
const mockGetMyPublicKey = jest.fn();

describe('createChannel', () => {
  let instance: SocketService;

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
        },
      },
    } as unknown as SocketService;
  });

  it('should generate a valid UUID for the channel', () => {
    const result = createChannel(instance);

    expect(result.channelId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
    );
  });

  it('should connect socket if not connected', () => {
    createChannel(instance);

    expect(instance.state.socket?.connect).toHaveBeenCalled();
  });

  it('should not connect socket if already connected', () => {
    instance.state.socket!.connected = true;
    createChannel(instance);

    expect(instance.state.socket?.connect).not.toHaveBeenCalled();
  });

  it('should setup channel listeners with correct channelId', () => {
    const result = createChannel(instance);

    expect(setupChannelListeners).toHaveBeenCalledWith(
      instance,
      result.channelId,
    );
  });

  it('should emit JOIN_CHANNEL event with correct parameters', () => {
    const result = createChannel(instance);

    expect(instance.state.socket?.emit).toHaveBeenCalledWith(
      'join_channel',
      result.channelId,
      'testContextcreateChannel',
    );
  });

  it('should return pubKey if available', () => {
    mockGetMyPublicKey.mockReturnValue('testPublicKey');
    const result = createChannel(instance);

    expect(result.pubKey).toBe('testPublicKey');
  });

  it('should return empty string for pubKey if not available', () => {
    mockGetMyPublicKey.mockReturnValue(undefined);
    const result = createChannel(instance);

    expect(result.pubKey).toBe('');
  });

  it('should log the creation process if debug is true', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;
    createChannel(instance);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'SocketService::testContext::createChannel()',
    );
    consoleDebugSpy.mockRestore();
  });
});
