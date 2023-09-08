import {
  RemoteConnectionProps,
  RemoteConnectionState,
} from '../RemoteConnection';
import { onOTPModalDisconnect } from './onOTPModalDisconnect';
import { reconnectWithModalOTP } from './reconnectWithModalOTP';
import { waitForOTPAnswer } from './waitForOTPAnswer';

jest.mock('./waitForOTPAnswer');
jest.mock('./onOTPModalDisconnect');

describe('reconnectWithModalOTP', () => {
  let state: RemoteConnectionState;
  let options: RemoteConnectionProps;

  const mockMount = jest.fn();
  const mockUnmount = jest.fn();
  const mockUpdateOTPValue = jest.fn();
  const mockOtpModal = jest.fn();
  const mockWaitForOTPAnswer = waitForOTPAnswer as jest.Mock;
  const mockOnOTPModalDisconnect = onOTPModalDisconnect as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

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

  it('should mount the OTP modal if state.pendingModal is already defined', async () => {
    mockWaitForOTPAnswer.mockResolvedValue('test_otp');

    await reconnectWithModalOTP(state, options);

    expect(mockMount).toHaveBeenCalled();
    expect(mockOtpModal).not.toHaveBeenCalled();
    expect(state.otpAnswer).toBe('test_otp');
  });

  it('should create and mount a new OTP modal if state.pendingModal is not defined', async () => {
    state.pendingModal = undefined;
    mockOtpModal.mockReturnValue({ mount: mockMount, unmount: mockUnmount });
    mockWaitForOTPAnswer.mockResolvedValue('test_otp');

    await reconnectWithModalOTP(state, options);

    expect(mockOtpModal).toHaveBeenCalled();
    expect(mockMount).not.toHaveBeenCalled();
    expect(state.otpAnswer).toBe('test_otp');
  });

  it('should update state.otpAnswer and the OTP modal when OTP is received', async () => {
    state.otpAnswer = 'initial_otp';
    mockWaitForOTPAnswer.mockResolvedValue('new_otp');

    await reconnectWithModalOTP(state, options);

    expect(state.otpAnswer).toBe('new_otp');
    expect(mockUpdateOTPValue).toHaveBeenCalledWith('new_otp');
  });

  it('should call onOTPModalDisconnect when the modal disconnect occurs', async () => {
    state.pendingModal = undefined;
    mockOtpModal.mockImplementation(({ onDisconnect }) => {
      onDisconnect();

      return { mount: mockMount, unmount: mockUnmount };
    });
    mockWaitForOTPAnswer.mockResolvedValue('test_otp');

    await reconnectWithModalOTP(state, options);

    expect(mockOnOTPModalDisconnect).toHaveBeenCalledWith(options, state);
  });

  it('should not call onOTPModalDisconnect if state.pendingModal is already defined', async () => {
    mockWaitForOTPAnswer.mockResolvedValue('test_otp');

    await reconnectWithModalOTP(state, options);

    expect(mockOnOTPModalDisconnect).not.toHaveBeenCalled();
  });
});
