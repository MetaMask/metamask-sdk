import { RemoteCommunication } from '../../../RemoteCommunication';
import { SocketService } from '../../../SocketService';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { StorageManager } from '../../../types/StorageManager';
import { logger } from '../../../utils/logger';
import { disconnect } from './disconnect';

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

    await disconnect({ options, instance });

    expect(instance.state.communicationLayer?.disconnect).toHaveBeenCalledWith(
      options,
    );

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.TERMINATED,
    );
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

  it('should not send a termination message if keysExchanged is false', async () => {
    const options = {
      terminate: true,
      sendMessage: true,
    };

    await disconnect({ options, instance });

    expect(
      instance.state.communicationLayer?.sendMessage,
    ).not.toHaveBeenCalled();
  });

  it('should reset ready and paused states', async () => {
    instance.state.ready = true;
    instance.state.paused = true;

    await disconnect({ instance });

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
