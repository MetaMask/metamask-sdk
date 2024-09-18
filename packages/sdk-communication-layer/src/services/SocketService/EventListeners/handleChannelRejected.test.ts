import { SocketService } from '../../../SocketService';
import { logger } from '../../../utils/logger';
import { handleChannelRejected } from './handleChannelRejected';

describe('handleChannelRejected', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const channelId = 'sampleChannelId';
  const mockEmit = jest.fn();
  const mockStart = jest.fn();
  const mockAreKeysExchanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
        context: 'someContext',
        isOriginator: false,
        resumed: false,
        clientsPaused: false,
        keyExchange: {
          areKeysExchanged: mockAreKeysExchanged,
          start: mockStart,
        },
        clientsConnected: false,
      },
      remote: { state: {} },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information', async () => {
    const handler = handleChannelRejected(instance, channelId);
    await handler('someId');

    expect(spyLogger).toHaveBeenCalled();
  });
});
