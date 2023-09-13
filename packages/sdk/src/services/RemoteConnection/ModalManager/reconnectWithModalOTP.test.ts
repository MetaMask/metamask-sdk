import { ChannelConfig } from '@metamask/sdk-communication-layer';
import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { Ethereum } from '../../Ethereum';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';
import { reconnectWithModalOTP } from './reconnectWithModalOTP';
import { waitForOTPAnswer } from './waitForOTPAnswer';

jest.mock('./waitForOTPAnswer');
jest.mock('./onOTPModalDisconnect');

jest.mock('../../Ethereum');

describe('reconnectWithModalOTP', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;
  let channelConfig: ChannelConfig;
  const mockEthereum = Ethereum as jest.Mocked<typeof Ethereum>;

  const mockMount = jest.fn(
    ({ displayOTP }: { displayOTP?: boolean } = {}) => displayOTP,
  );
  const mockUnmount = jest.fn();
  const mockUpdateOTPValue = jest.fn();
  const mockOtpModal = jest.fn(() => {
    return {
      mount: mockMount,
      unmount: mockUnmount,
      updateOTPValue: mockUpdateOTPValue,
    };
  });
  const mockWaitForOTPAnswer = waitForOTPAnswer as jest.Mock;
  const mockOnOTPModalDisconnect = onOTPModalDisconnect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEthereum.getProvider.mockReturnValue({
      _setConnected: jest.fn(),
      getState: jest.fn(),
    } as unknown as any);

    channelConfig = {
      channelId: 'test_channel_id',
      lastActive: Date.now(),
      validUntil: Date.now(),
    };

    state = {
      otpAnswer: 'test_otp',
      pendingModal: {
        mount: mockMount,
        unmount: mockUnmount,
        updateOTPValue: mockUpdateOTPValue,
      },
    } as unknown as RemoteConnectionState;

    options = {
      modals: {
        otp: mockOtpModal,
        onPendingModalDisconnect: jest.fn(),
      },
    } as unknown as RemoteConnectionProps;
  });

  describe('channel was active recently', () => {
    beforeEach(() => {
      channelConfig.lastActive = Date.now() - 30 * 60 * 1000; // 30 minutes ago
    });

    it('should handle a recently active channel', async () => {
      channelConfig.lastActive = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      await reconnectWithModalOTP(state, options, channelConfig);

      const mockProvider = mockEthereum.getProvider();
      expect(mockProvider._setConnected).toHaveBeenCalled();
      expect(mockMount).toHaveBeenCalledWith({
        displayOTP: false,
      });
      expect(state.pendingModal?.unmount).toHaveBeenCalled();
      expect(state.authorized).toBe(true);
    });

    it('should unmount installModal if channel was active recently', async () => {
      channelConfig.lastActive = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      state.installModal = {
        unmount: jest.fn(),
      };

      await reconnectWithModalOTP(state, options, channelConfig);
      expect(state.installModal?.unmount).toHaveBeenCalledWith(false);
    });

    it('should log debug message in developer mode', async () => {
      state.developerMode = true;
      channelConfig.lastActive = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      (mockEthereum.getProvider().getState as jest.Mock).mockImplementation(
        () => 'mockState',
      );

      jest.spyOn(console, 'debug').mockImplementation();
      await reconnectWithModalOTP(state, options, channelConfig);
      expect(console.debug).toHaveBeenCalledWith(
        "RCPMS::on 'authorized' provider.state",
        'mockState',
      );
    });

    it('should go through OTP flow if channelConfig.lastActive is undefined', async () => {
      delete channelConfig.lastActive;
      mockWaitForOTPAnswer.mockResolvedValue('test_otp');

      await reconnectWithModalOTP(state, options, channelConfig);
      expect(mockWaitForOTPAnswer).toHaveBeenCalled();
    });
  });

  describe('channel was NOT active recently', () => {
    beforeEach(() => {
      channelConfig.lastActive = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
    });

    it('should mount the OTP modal if state.pendingModal is already defined', async () => {
      mockWaitForOTPAnswer.mockResolvedValue('test_otp');

      await reconnectWithModalOTP(state, options, channelConfig);

      expect(mockMount).toHaveBeenCalled();
      expect(mockOtpModal).not.toHaveBeenCalled();
      expect(state.otpAnswer).toBe('test_otp');
    });

    it('should create and mount a new OTP modal if state.pendingModal is not defined', async () => {
      state.pendingModal = undefined;
      mockOtpModal.mockReturnValue({
        mount: mockMount,
        unmount: mockUnmount,
        updateOTPValue: mockUpdateOTPValue,
      });
      mockWaitForOTPAnswer.mockResolvedValue('test_otp');

      await reconnectWithModalOTP(state, options, channelConfig);

      expect(mockOtpModal).toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
      expect(state.otpAnswer).toBe('test_otp');
    });

    it('should update state.otpAnswer and the OTP modal when OTP is received', async () => {
      state.otpAnswer = 'initial_otp';
      mockWaitForOTPAnswer.mockResolvedValue('new_otp');

      await reconnectWithModalOTP(state, options, channelConfig);

      expect(state.otpAnswer).toBe('new_otp');
      expect(mockUpdateOTPValue).toHaveBeenCalledWith('new_otp');
    });

    it('should not call onOTPModalDisconnect if state.pendingModal is already defined', async () => {
      mockWaitForOTPAnswer.mockResolvedValue('test_otp');

      await reconnectWithModalOTP(state, options, channelConfig);

      expect(mockOnOTPModalDisconnect).not.toHaveBeenCalled();
    });
  });
});
