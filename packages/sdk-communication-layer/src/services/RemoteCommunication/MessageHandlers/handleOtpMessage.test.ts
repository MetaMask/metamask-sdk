/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RemoteCommunication } from '../../../RemoteCommunication';
import { CommunicationLayerMessage } from '../../../types/CommunicationLayerMessage';
import { EventType } from '../../../types/EventType';
import { handleOtpMessage } from './handleOtpMessage';

describe('handleOtpMessage', () => {
  let instance: RemoteCommunication;
  const mockMessage = {
    otpAnswer: '123456',
  } as unknown as CommunicationLayerMessage;

  beforeEach(() => {
    jest.clearAllMocks();

    instance = {
      state: {
        walletInfo: {
          version: '6.5',
        },
      },
      emit: jest.fn(),
    } as unknown as RemoteCommunication;
  });

  it('should emit the correct OTP', () => {
    handleOtpMessage(instance, mockMessage);
    expect(instance.emit).toHaveBeenCalledWith(
      EventType.OTP,
      mockMessage.otpAnswer,
    );
  });

  it('should trigger backward compatibility for wallet versions <6.6', () => {
    handleOtpMessage(instance, mockMessage);
    expect(instance.emit).toHaveBeenCalledWith(EventType.SDK_RPC_CALL, {
      method: 'eth_requestAccounts',
      params: [],
    });
  });

  it('should not trigger backward compatibility for wallet versions >=6.6', () => {
    instance.state.walletInfo!.version = '6.6';
    handleOtpMessage(instance, mockMessage);
    expect(instance.emit).not.toHaveBeenCalledWith(EventType.SDK_RPC_CALL, {
      method: 'eth_requestAccounts',
      params: [],
    });
  });

  it('should trigger backward compatibility when walletInfo.version is an empty string', () => {
    instance.state.walletInfo!.version = '';
    handleOtpMessage(instance, mockMessage);
    expect(instance.emit).toHaveBeenCalledWith(EventType.SDK_RPC_CALL, {
      method: 'eth_requestAccounts',
      params: [],
    });
  });

  it('should ignore OTP message if otpAnswer is not provided', () => {
    const incompleteMessage = {} as unknown as CommunicationLayerMessage;
    handleOtpMessage(instance, incompleteMessage);
    expect(instance.emit).not.toHaveBeenCalledWith(
      EventType.OTP,
      expect.anything(),
    );
  });

  it('should log a warning when backward compatibility is triggered', () => {
    jest.spyOn(console, 'warn').mockImplementation();
    instance.state.walletInfo!.version = '6.5';
    handleOtpMessage(instance, mockMessage);
    expect(console.warn).toHaveBeenCalledWith(
      `RemoteCommunication::on 'otp' -- backward compatibility <6.6 -- triger eth_requestAccounts`,
    );
  });
});
