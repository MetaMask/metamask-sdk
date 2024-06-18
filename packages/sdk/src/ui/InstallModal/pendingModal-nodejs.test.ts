import * as loggerModule from '../../utils/logger';
import PendingModal from './pendingModal-nodejs';

describe('PendingModal', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log initial message upon invocation', () => {
    PendingModal();

    expect(spyLogger).toHaveBeenCalledWith(
      '[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!',
    );
  });

  it('should return an object with unmount, updateOTPValue, and mount functions', () => {
    const result = PendingModal();

    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
    expect(result).toHaveProperty('updateOTPValue');
    expect(typeof result.updateOTPValue).toBe('function');
    expect(result).toHaveProperty('mount');
    expect(typeof result.mount).toBe('function');
  });

  it('should log OTP value if provided to updateOTPValue function', () => {
    const result = PendingModal();
    const otpValue = '123456';

    result.updateOTPValue(otpValue);

    expect(spyLogger).toHaveBeenCalledWith(
      '[UI: pendingModal-nodejs: PendingModal()] Choose the following value on your metamask mobile wallet: 123456',
    );
  });

  it('should not log OTP value if empty string is provided to updateOTPValue function', () => {
    const result = PendingModal();

    result.updateOTPValue('');

    expect(spyLogger).toHaveBeenCalledWith(
      '[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!',
    );
  });

  describe('mount()', () => {
    it('should log message upon invocation', () => {
      const result = PendingModal();

      result.mount();

      expect(spyLogger).toHaveBeenCalledWith(
        '[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!',
      );
    });
  });

  describe('unmount()', () => {
    it('should log message upon invocation', () => {
      const result = PendingModal();

      result.unmount();

      expect(spyLogger).toHaveBeenCalledWith(
        '[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!',
      );
    });
  });

  describe('updateOTPValue()', () => {
    it('should log OTP value if provided', () => {
      const result = PendingModal();
      const otpValue = '123456';

      result.updateOTPValue(otpValue);

      expect(spyLogger).toHaveBeenCalledWith(
        '[UI: pendingModal-nodejs: PendingModal()] Choose the following value on your metamask mobile wallet: 123456',
      );
    });

    it('should not log OTP value if empty string is provided', () => {
      const result = PendingModal();

      result.updateOTPValue('');

      expect(spyLogger).toHaveBeenCalledWith(
        '[UI: pendingModal-nodejs: PendingModal()] Please open the MetaMask wallet app and confirm the connection. Thank you!',
      );
    });
  });
});
