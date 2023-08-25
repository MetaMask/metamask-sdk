import { SocketServiceState } from '../../../SocketService';
import { checkSameId } from './checkSameId';

describe('checkSameId', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(console, 'error').mockImplementation();
  });

  it('should not throw an error if ids match', () => {
    const state = {
      channelId: '12345',
      debug: false,
    } as SocketServiceState;

    expect(() => checkSameId(state, '12345')).not.toThrow();
  });

  it('should throw an error if ids do not match', () => {
    const state = {
      channelId: '12345',
      debug: false,
    } as SocketServiceState;

    expect(() => checkSameId(state, '54321')).toThrow('Wrong id');
  });

  it('should not log an error if debugging is disabled and ids do not match', () => {
    const state = {
      channelId: '12345',
      debug: false,
    } as SocketServiceState;

    try {
      checkSameId(state, '54321');
    } catch (e) {
      // do nothing
    }

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should log an error if debugging is enabled and ids do not match', () => {
    const state = {
      channelId: '12345',
      debug: true,
    } as SocketServiceState;

    try {
      checkSameId(state, '54321');
    } catch (e) {
      // do nothing
    }

    expect(console.error).toHaveBeenCalledWith(
      'Wrong id 54321 - should be 12345',
    );
  });
});
