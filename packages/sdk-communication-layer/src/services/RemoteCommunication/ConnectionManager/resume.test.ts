import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import * as loggerModule from '../../../utils/logger';
import { resume } from './resume';

describe('resume', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(loggerModule, 'loggerRemoteLayer');
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

  it('should log channel info', () => {
    resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=testChannel',
    );
  });

  it('should call resume on the communication layer', () => {
    resume(instance);
    expect(mockResume).toHaveBeenCalledTimes(1);
  });

  it('should set connection status to LINKED', () => {
    resume(instance);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should handle when communicationLayer is not defined', () => {
    delete instance.state.communicationLayer;

    expect(() => {
      resume(instance);
    }).not.toThrow();

    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=testChannel',
    );
  });

  it('should set connection status to LINKED even when communicationLayer is not defined', () => {
    delete instance.state.communicationLayer;

    resume(instance);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should handle when channelId is not defined', () => {
    instance.state.channelId = undefined;

    resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=undefined',
    );
  });

  it('should log debug info when channelId is undefined', () => {
    instance.state.channelId = undefined;

    resume(instance);
    expect(spyLogger).toHaveBeenCalledWith(
      '[RemoteCommunication: resume()] channel=undefined',
    );
  });
});
