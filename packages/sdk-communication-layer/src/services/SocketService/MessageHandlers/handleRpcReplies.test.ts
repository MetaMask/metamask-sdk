import { SocketService } from '../../../SocketService';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { waitForRpc } from '../../../utils/wait';
import { handleRpcReplies } from './handleRpcReplies';

jest.mock('../../../utils/wait');

describe('handleRpcReplies', () => {
  let instance: SocketService;
  const mockWaitForRpc = waitForRpc as jest.MockedFunction<typeof waitForRpc>;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: false,
      },
    } as unknown as SocketService;

    mockWaitForRpc.mockResolvedValue({
      elapsedTime: 100,
      result: 'success',
      timestamp: 123456789,
      method: 'testMethod',
    });
  });

  it('should call waitForRpc if instance is the originator and message has rpcId', async () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };

    instance.state.isOriginator = true;

    await handleRpcReplies(instance, message);

    expect(mockWaitForRpc).toHaveBeenCalledWith(
      '123',
      instance.state.rpcMethodTracker,
      200,
    );
  });

  it('should not call waitForRpc if instance is not the originator', async () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
      // other properties
    };

    instance.state.isOriginator = false;

    await handleRpcReplies(instance, message);

    expect(mockWaitForRpc).not.toHaveBeenCalled();
  });

  it('should log debug info when reply is received', async () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };

    instance.state.isOriginator = true;
    instance.state.debug = true;

    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    mockWaitForRpc.mockResolvedValueOnce({
      elapsedTime: 100,
      result: 'success',
      timestamp: 123456789,
      method: 'testMethod',
    });

    await handleRpcReplies(instance, message);

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      'SocketService::waitForRpc id=123 testMethod ( 100 ms)',
      'success',
    );
  });

  it('should log warning when there is an error', async () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };

    instance.state.isOriginator = true;

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    mockWaitForRpc.mockRejectedValue(new Error('Test error'));

    await handleRpcReplies(instance, message);

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });
});
