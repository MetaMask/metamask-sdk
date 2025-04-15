import { SendAnalytics } from '@metamask/analytics-client';
import { OriginatorInfo } from '@metamask/sdk-types';
import { RemoteCommunication } from '../../../RemoteCommunication';
import { ConnectionStatus } from '../../../types/ConnectionStatus';
import { MessageType } from '../../../types/MessageType';
import { logger } from '../../../utils/logger';
import { setLastActiveDate } from '../StateManger';
import { handleKeysExchangedEvent } from './handleKeysExchangedEvent';

jest.mock('@metamask/analytics-client', () => {
  return {
    SendAnalytics: jest.fn().mockResolvedValue(undefined),
  };
});
jest.mock('../StateManger');

describe('handleKeysExchangedEvent', () => {
  let instance: RemoteCommunication;

  const spyLogger = jest.spyOn(logger, 'RemoteCommunication');

  const mockSetConnectionStatus = jest.fn();
  const mockSendMessage = jest.fn();

  jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        debug: true,
        context: 'mockContext',
        channelId: 'mockChannel',
        analytics: true,
        sdkVersion: '1.0',
        walletInfo: { version: '1.0' },
        communicationLayer: {
          sendMessage: mockSendMessage,
          getKeyInfo: () => ({
            keysExchanged: true,
            ecies: { public: '', private: '' },
          }),
        },
        communicationServerUrl: 'mockUrl',
      },
      setConnectionStatus: mockSetConnectionStatus,
    } as unknown as RemoteCommunication;
  });

  it('should log diagnostic information', () => {
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should update the instance connection status to LINKED', () => {
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(
      ConnectionStatus.LINKED,
    );
  });

  it('should send a READY message if the instance is not the originator', () => {
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: false,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });
    expect(mockSendMessage).toHaveBeenCalledWith({ type: MessageType.READY });
    expect(instance.state.ready).toBe(true);
    expect(instance.state.paused).toBe(false);
  });

  it('should send an ORIGINATOR_INFO message if the instance is the originator and originatorInfo has not been sent', () => {
    instance.state.originatorInfoSent = false;
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(mockSendMessage).toHaveBeenCalledWith({
      type: MessageType.ORIGINATOR_INFO,
      originatorInfo: instance.state.originatorInfo,
      originator: instance.state.originatorInfo,
    });
    expect(instance.state.originatorInfoSent).toBe(true);
  });

  it('should attempt to send analytics when analytics is enabled', () => {
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(SendAnalytics).toHaveBeenCalled();
  });

  it('should not attempt to send analytics when analytics is disabled', () => {
    instance.state.analytics = false;
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(SendAnalytics).not.toHaveBeenCalled();
  });

  it('should set the last active date', () => {
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    expect(setLastActiveDate).toHaveBeenCalledWith(instance, expect.any(Date));
  });

  it('should log an error when sending analytics fails', async () => {
    (SendAnalytics as jest.Mock).mockRejectedValue(new Error('Mock error'));
    const handler = handleKeysExchangedEvent(instance);
    handler({
      isOriginator: true,
      originatorInfo: {} as OriginatorInfo,
      originator: {} as OriginatorInfo,
    });

    await expect(SendAnalytics).rejects.toThrow('Mock error');
    expect(console.error).toHaveBeenCalledWith(
      'Failed to send analytics key exchanged event',
      expect.anything(),
    );
  });
});
