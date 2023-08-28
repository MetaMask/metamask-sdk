import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { clean } from './clean';

describe('clean', () => {
  let state: RemoteCommunicationState;

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      debug: false,
      context: 'test',
      channelConfig: {
        channelId: 'channelId',
        validUntil: 12345679,
      },
      ready: true,
      originatorConnectStarted: true,
    } as RemoteCommunicationState;
  });

  it('should reset state properties to their default values', () => {
    clean(state);

    expect(state.channelConfig).toBeUndefined();
    expect(state.ready).toBe(false);
    expect(state.originatorConnectStarted).toBe(false);
  });

  it('should log a debug message if debug is true', () => {
    jest.spyOn(console, 'debug').mockImplementation();

    state.debug = true;

    clean(state);

    expect(console.debug).toHaveBeenCalledWith(
      'RemoteCommunication::test::clean()',
    );
  });

  it('should not log a debug message if debug is false', () => {
    jest.spyOn(console, 'debug').mockImplementation();

    clean(state);

    expect(console.debug).not.toHaveBeenCalled();
  });
});
