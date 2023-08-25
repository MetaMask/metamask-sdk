import { trackRpcMethod } from '../trackRpcMethod';
import { SocketService } from '../../../../SocketService';
import { CommunicationLayerMessage } from '../../../../types/CommunicationLayerMessage';

describe('trackRpcMethod', () => {
  let instance: SocketService;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        isOriginator: true,
        rpcMethodTracker: {},
      },
    } as unknown as SocketService;
  });

  it('should track the RPC method when the instance is the originator and has a valid RPC ID', () => {
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };
    trackRpcMethod(instance, message);

    expect(instance.state.rpcMethodTracker['123']).toBeDefined();
    expect(instance.state.rpcMethodTracker['123'].method).toBe('testMethod');
    expect(typeof instance.state.rpcMethodTracker['123'].timestamp).toBe(
      'number',
    );
  });

  it('should not track the RPC method if the instance is not the originator', () => {
    instance.state.isOriginator = false;
    const message: CommunicationLayerMessage = {
      id: '123',
      method: 'testMethod',
    };
    trackRpcMethod(instance, message);

    expect(instance.state.rpcMethodTracker['123']).toBeUndefined();
  });

  it('should not track the RPC method if the message lacks an RPC ID', () => {
    const message: CommunicationLayerMessage = {
      method: 'testMethod',
    };
    trackRpcMethod(instance, message);

    expect(Object.keys(instance.state.rpcMethodTracker)).toHaveLength(0);
  });
});
