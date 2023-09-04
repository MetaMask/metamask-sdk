import { ModalLoader } from '@metamask/sdk-install-modal-web';
import sdkWebPendingModal from './pendingModal-web';

jest.mock('@metamask/sdk-install-modal-web');

describe('sdkWebPendingModal', () => {
  const mockModalLoader = ModalLoader as jest.MockedClass<typeof ModalLoader>;

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
    const result = sdkWebPendingModal();

    console.debug('Returned from sdkWebPendingModal:', result);

    expect(mockRenderPendingModal).toHaveBeenCalled();
  });

  it('should return an object with mount, unmount, and updateOTPValue functions', () => {
    const result = sdkWebPendingModal();

    expect(result).toHaveProperty('mount');
    expect(typeof result.mount).toBe('function');
    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
    expect(result).toHaveProperty('updateOTPValue');
    expect(typeof result.updateOTPValue).toBe('function');
  });

  it('should call ModalLoader.updateOTPValue when updateOTPValue is invoked', () => {
    const otpValue = '123456';
    const result = sdkWebPendingModal();

    result.updateOTPValue(otpValue);

    expect(mockUpdateOTPValue).toHaveBeenCalledWith(otpValue);
  });

  it('should unmount when unmount is invoked', () => {
    const result = sdkWebPendingModal();
    result.unmount();

    expect(mockRenderPendingModal).toHaveBeenCalledTimes(1);
  });

  it('should mount correctly when mount is invoked', () => {
    const result = sdkWebPendingModal();
    result.mount();

    expect(mockRenderPendingModal).toHaveBeenCalledTimes(1);
  });
});
