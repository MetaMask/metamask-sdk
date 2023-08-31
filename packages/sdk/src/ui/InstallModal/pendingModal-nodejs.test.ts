import PendingModal from './pendingModal-nodejs';

describe('PendingModal', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  it('should log initial message upon invocation', () => {
    PendingModal();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Please open the MetaMask wallet app and confirm the connection. Thank you!',
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

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      `Choose the following value on your metamask mobile wallet: ${otpValue}`,
    );
  });

  it('should not log OTP value if empty string is provided to updateOTPValue function', () => {
    const result = PendingModal();

    result.updateOTPValue('');

    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  describe('mount()', () => {
    it('should log message upon invocation', () => {
      const result = PendingModal();

      result.mount();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Please open the MetaMask wallet app and confirm the connection. Thank you!',
      );
    });
  });

  describe('unmount()', () => {
    it('should log message upon invocation', () => {
      const result = PendingModal();

      result.unmount();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Please open the MetaMask wallet app and confirm the connection. Thank you!',
      );
    });
  });

  describe('updateOTPValue()', () => {
    it('should log OTP value if provided', () => {
      const result = PendingModal();
      const otpValue = '123456';

      result.updateOTPValue(otpValue);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        `Choose the following value on your metamask mobile wallet: ${otpValue}`,
      );
    });

    it('should not log OTP value if empty string is provided', () => {
      const result = PendingModal();

      result.updateOTPValue('');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });
});
