import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import { handleKeyInfo } from './handleKeyInfo';

describe('handleKeyInfo', () => {
  let instance: SocketService;
  const mockEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    instance.state.debug = true;

    const handler = handleKeyInfo(instance);
    const mockEventData = { someKey: 'someValue' };
    handler(mockEventData);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `SocketService::on 'KEY_INFO'`,
      mockEventData,
    );
    consoleDebugSpy.mockRestore();
  });

  it('should emit KEY_INFO event with the provided event data', () => {
    const handler = handleKeyInfo(instance);
    const mockEventData = { someKey: 'someValue' };
    handler(mockEventData);

    expect(mockEmit).toHaveBeenCalledWith(EventType.KEY_INFO, mockEventData);
  });
});
