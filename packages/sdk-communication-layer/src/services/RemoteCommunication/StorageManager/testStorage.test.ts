import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { logger } from '../../../utils/logger';
import { testStorage } from './testStorage';

describe('testStorage', () => {
  let state: RemoteCommunicationState;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  beforeEach(() => {
    jest.clearAllMocks();

    state = {
      channelId: 'test-channel-id',
      storageManager: {
        getPersistedChannelConfig: jest.fn().mockResolvedValue({}),
      },
      debug: false,
    } as unknown as RemoteCommunicationState;
  });

  it('should log the result', async () => {
    await testStorage(state);

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: testStorage()] res',
      expect.any(Object),
    );
  });

  it('should handle case when storageManager is not defined', async () => {
    state.storageManager = undefined;

    const res = await testStorage(state);

    expect(res).toBeUndefined();

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: testStorage()] res',
      undefined,
    );
  });
});
