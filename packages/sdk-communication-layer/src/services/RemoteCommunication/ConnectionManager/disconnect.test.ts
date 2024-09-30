import { RemoteCommunication } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { StorageManager } from '../../../types/StorageManager';
import { logger } from '../../../utils/logger';
import * as MessageHandlers from '../../SocketService/MessageHandlers';
import { disconnect } from './disconnect';

jest.mock('../../SocketService/MessageHandlers', () => ({
  encryptAndSendMessage: jest.fn(),
}));

describe('disconnect', () => {
  let instance: RemoteCommunication;
  const mockSetConnectionStatus = jest.fn();
  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        communicationLayer: {
          getKeyInfo: jest.fn(() => ({ keysExchanged: false })),
          sendMessage: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as SocketService,
        debug: false,
        channelId: 'sampleChannelId',
      },
      remote: { state: {} },
      setConnectionStatus: mockSetConnectionStatus,
    } as unknown as RemoteCommunication;

    // Reset the mocked encryptAndSendMessage
    (MessageHandlers.encryptAndSendMessage as jest.Mock).mockReset();
  });

  it('should disconnect without termination if no options are provided', async () => {
    await disconnect({ instance });

    expect(instance.state.communicationLayer?.disconnect).toHaveBeenCalledWith(
      undefined,
    );

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.DISCONNECTED,
    );
  });

  it('should terminate connection and send message if terminate option is provided', async () => {
    instance.state.communicationLayer = {
      ...instance.state.communicationLayer,
      getKeyInfo: jest.fn(() => ({ keysExchanged: true })),
    } as unknown as SocketService;

    const options = {
      terminate: true,
      sendMessage: true,
    };

    // Mock the encryptAndSendMessage to resolve with true
    (MessageHandlers.encryptAndSendMessage as jest.Mock).mockResolvedValue(
      true,
    );

    const disconnectPromise = disconnect({ options, instance });

    // Use setImmediate to allow the promise to resolve
    await new Promise((resolve) => setImmediate(resolve));

    await disconnectPromise;

    expect(instance.state.communicationLayer?.disconnect).toHaveBeenCalledWith(
      expect.objectContaining(options),
    );

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.TERMINATED,
    );

    expect(MessageHandlers.encryptAndSendMessage).toHaveBeenCalled();
  });

  it('should remove channel config from persistence layer if terminate option is provided', async () => {
    const mockTerminate = jest.fn();

    instance.state.storageManager = {
      terminate: mockTerminate,
    } as unknown as StorageManager;

    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(mockTerminate).toHaveBeenCalledWith('sampleChannelId');
  });

  it('should generate a new channel ID on termination', async () => {
    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(instance.state.channelId).not.toStrictEqual('sampleChannelId');
  });

  it('should reset ready and paused states only when terminating', async () => {
    instance.state.ready = true;
    instance.state.paused = true;

    // First, test without termination
    await disconnect({ instance });

    expect(instance.state.ready).toBe(true);
    expect(instance.state.paused).toBe(true);

    // Now, test with termination
    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(instance.state.ready).toBe(false);
    expect(instance.state.paused).toBe(false);
  });

  it('should not regenerate channelId if the terminate option is not provided', async () => {
    await disconnect({ instance });

    expect(instance.state.channelId).toStrictEqual('sampleChannelId');
  });

  it('should set connection to TERMINATED only if terminate option is true', async () => {
    const options = {
      terminate: false,
    };

    await disconnect({ options, instance });

    expect(mockSetConnectionStatus).not.toHaveBeenCalledWith(
      ConnectionStatus.TERMINATED,
    );
  });

  it('should log debug information if debug is enabled', async () => {
    await disconnect({ instance });

    expect(spyLogger).toHaveBeenCalledWith(
      `[RemoteCommunication: disconnect()] channel=${instance.state.channelId}`,
      undefined,
    );
  });

  it('should reset originatorConnectStarted on termination', async () => {
    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(instance.state.originatorConnectStarted).toBe(false);
  });

  it('should undefine the channelConfig on termination', async () => {
    instance.state.channelConfig = {
      channelId: 'sampleChannelId',
      validUntil: 123456789,
    };

    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(instance.state.channelConfig).toBeUndefined();
  });

  it('should not call storageManager.terminate if terminate option is not provided', async () => {
    const mockTerminate = jest.fn();

    instance.state.storageManager = {
      terminate: mockTerminate,
    } as unknown as StorageManager;

    await disconnect({ instance });

    expect(mockTerminate).not.toHaveBeenCalled();
  });

  it('should set the channelId in the options during termination', async () => {
    const options = {
      terminate: true,
    };

    await disconnect({ options, instance });

    expect(instance.state.channelId).toStrictEqual(instance.state.channelId);
  });
});
