import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { logger } from '../../../utils/logger';
import { handleKeysExchanged } from './handleKeysExchanged';

describe('handleKeysExchanged', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(logger, 'SocketService');
  const mockEmit = jest.fn();
  const mockGetKeyInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        isOriginator: false,
        keyExchange: {
          areKeysExchanged: jest.fn().mockReturnValue(true),
        },
      },
      remote: {
        state: {},
      },
      emit: mockEmit,
      getKeyInfo: mockGetKeyInfo,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const handler = handleKeysExchanged(instance);
    handler();

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleKeysExchanged()] on 'keys_exchanged' keyschanged=true",
    );
  });

  it('should emit KEYS_EXCHANGED event with the keys exchanged status and isOriginator', () => {
    const handler = handleKeysExchanged(instance);
    handler();

    expect(mockEmit).toHaveBeenCalledWith(EventType.KEYS_EXCHANGED, {
      keysExchanged: true,
      isOriginator: instance.state.isOriginator,
    });
  });

  it('should emit SERVICE_STATUS event with the current key information', () => {
    const mockKeyInfo = { key: 'testKey' };
    mockGetKeyInfo.mockReturnValueOnce(mockKeyInfo);

    const handler = handleKeysExchanged(instance);
    handler();

    expect(mockEmit).toHaveBeenCalledWith(EventType.SERVICE_STATUS, {
      keyInfo: mockKeyInfo,
    });
  });
});
