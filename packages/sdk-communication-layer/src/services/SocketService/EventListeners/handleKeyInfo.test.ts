import { SocketService } from '../../../SocketService';
import { EventType } from '../../../types/EventType';
import * as loggerModule from '../../../utils/logger';
import { handleKeyInfo } from './handleKeyInfo';

describe('handleKeyInfo', () => {
  let instance: SocketService;

  const spyLogger = jest.spyOn(loggerModule, 'loggerServiceLayer');
  const mockEmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      emit: mockEmit,
    } as unknown as SocketService;
  });

  it('should log debug information when debugging is enabled and the handler is called', () => {
    const handler = handleKeyInfo(instance);
    const mockEventData = { someKey: 'someValue' };
    handler(mockEventData);

    expect(spyLogger).toHaveBeenCalledWith(
      "[SocketService: handleKeyInfo()] on 'KEY_INFO'",
      mockEventData,
    );
  });

  it('should emit KEY_INFO event with the provided event data', () => {
    const handler = handleKeyInfo(instance);
    const mockEventData = { someKey: 'someValue' };
    handler(mockEventData);

    expect(mockEmit).toHaveBeenCalledWith(EventType.KEY_INFO, mockEventData);
  });
});
