import { i18n } from 'i18next';
import sdkWebPendingModal from './pendingModal-web';
import ModalLoader from './Modal-web';

jest.mock('./Modal-web');

describe('sdkWebPendingModal', () => {
  const mockModalLoader = ModalLoader as jest.MockedClass<typeof ModalLoader>;
  let mockI18n: i18n = {
    t: jest.fn((key) => key),
  } as unknown as i18n;

  const mockRenderPendingModal = jest.fn();
  const mockUpdateOTPValue = jest.fn();

  mockModalLoader.mockImplementation(
    () =>
      ({
        renderPendingModal: mockRenderPendingModal,
        updateOTPValue: mockUpdateOTPValue,
      } as any),
  );

  beforeEach(() => {
    jest.clearAllMocks();

    mockI18n = {
      t: jest.fn((key) => key),
    } as unknown as i18n;

    global.document = {
      createElement: jest.fn(
        () =>
          ({
            style: {},
            appendChild: jest.fn(),
          } as any),
      ),
      body: {
        appendChild: jest.fn(),
      },
    } as any;
  });

  it('should automatically mount upon initialization', () => {
    const result = sdkWebPendingModal({
      debug: true,
      i18nInstance: mockI18n,
      onDisconnect() {
        return false;
      },
    });

    console.debug('Returned from sdkWebPendingModal:', result);

    expect(mockRenderPendingModal).toHaveBeenCalled();
  });

  it('should return an object with mount, unmount, and updateOTPValue functions', () => {
    const result = sdkWebPendingModal({
      debug: true,
      i18nInstance: mockI18n,
      onDisconnect() {
        return false;
      },
    });

    expect(result).toHaveProperty('mount');
    expect(typeof result.mount).toBe('function');
    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
    expect(result).toHaveProperty('updateOTPValue');
    expect(typeof result.updateOTPValue).toBe('function');
  });

  it('should call ModalLoader.updateOTPValue when updateOTPValue is invoked', () => {
    const otpValue = '123456';
    const result = sdkWebPendingModal({
      debug: true,
      i18nInstance: mockI18n,
      onDisconnect() {
        return false;
      },
    });

    result.updateOTPValue(otpValue);

    expect(mockUpdateOTPValue).toHaveBeenCalledWith(otpValue);
  });

  it('should unmount when unmount is invoked', () => {
    const result = sdkWebPendingModal({
      debug: true,
      i18nInstance: mockI18n,
      onDisconnect() {
        return false;
      },
    });
    result.unmount();

    expect(mockRenderPendingModal).toHaveBeenCalledTimes(1);
  });

  it('should mount correctly when mount is invoked', () => {
    const result = sdkWebPendingModal({
      debug: true,
      i18nInstance: mockI18n,
      onDisconnect() {
        return false;
      },
    });
    result.mount();

    expect(mockRenderPendingModal).toHaveBeenCalledTimes(1);
  });
});
