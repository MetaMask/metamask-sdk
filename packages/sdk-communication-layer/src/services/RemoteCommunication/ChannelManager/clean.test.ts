import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { logger } from '../../../utils/logger';
import { clean } from './clean';

describe('clean', () => {
  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');
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

  it('should log a debug message', () => {
    clean(state);

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: clean()] context=test',
    );
  });
});
