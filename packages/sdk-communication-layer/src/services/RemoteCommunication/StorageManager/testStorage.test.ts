import { RemoteCommunicationState } from '../../../RemoteCommunication';
import { testStorage } from './testStorage';

describe('testStorage', () => {
  let state: RemoteCommunicationState;

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

  it('should call getPersistedChannelConfig with correct channel ID', async () => {
    await testStorage(state);
    expect(
      state.storageManager?.getPersistedChannelConfig,
    ).toHaveBeenCalledWith(state.channelId);
  });

  it('should log the result', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug');
    await testStorage(state);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'RemoteCommunication.testStorage() res',
      expect.any(Object),
    );
    consoleDebugSpy.mockRestore();
  });

  it('should handle case when storageManager is not defined', async () => {
    state.storageManager = undefined;
    const consoleDebugSpy = jest.spyOn(console, 'debug');

    const res = await testStorage(state);

    expect(res).toBeUndefined();

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'RemoteCommunication.testStorage() res',
      undefined,
    );
    consoleDebugSpy.mockRestore();
  });
});
