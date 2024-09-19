import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { logger } from '../../../utils/logger';
import { resume } from './resume';

describe('resume', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');
  const mockResume = jest.fn();
  const mockSetConnectionStatus = jest.fn();

  jest.spyOn(console, 'debug').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        channelId: 'testChannel',
        communicationLayer: {
          resume: mockResume,
        },
      },
      setConnectionStatus: mockSetConnectionStatus,
    } as unknown as RemoteCommunication;
  });

  it('should log channel info', async () => {
    await resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=testChannel',
    );
  });

  it('should call resume on the communication layer', async () => {
    await resume(instance);
    expect(mockResume).toHaveBeenCalledTimes(1);
  });

  it('should set connection status to LINKED', async () => {
    await resume(instance);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should handle when communicationLayer is not defined', async () => {
    delete instance.state.communicationLayer;

    expect(async () => {
      await resume(instance);
    }).not.toThrow();

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=testChannel',
    );
  });

  it('should set connection status to LINKED even when communicationLayer is not defined', async () => {
    delete instance.state.communicationLayer;

    await resume(instance);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should handle when channelId is not defined', async () => {
    instance.state.channelId = undefined;

    await resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=undefined',
    );
  });

  it('should log debug info when channelId is undefined', async () => {
    instance.state.channelId = undefined;

    await resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=undefined',
    );
  });
});
