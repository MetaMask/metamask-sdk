import { i18n } from 'i18next';
import * as loggerModule from '../../utils/logger';
import sdkWebInstallModal from './InstallModal-web';
import ModalLoader from './Modal-web';

jest.mock('./Modal-web');
jest.mock('i18next', () => ({
  t: jest.fn((key) => key),
}));

describe('sdkWebInstallModal', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  let documentSpy: jest.SpyInstance;
  let mockI18n: i18n = {
    t: jest.fn((key) => key),
  } as unknown as i18n;

  const mockModalLoader = ModalLoader as jest.MockedClass<typeof ModalLoader>;

  const modalLoaderMock = {
    renderSelectModal: jest.fn(),
    renderInstallModal: jest.fn(),
    updateQRCode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockModalLoader.mockImplementation(() => modalLoaderMock as any);

    mockI18n = {
      t: jest.fn((key) => key),
    } as unknown as i18n;

    global.document = {
      createElement: jest.fn(() => ({
        style: {},
        appendChild: jest.fn(),
      })),
      body: {
        appendChild: jest.fn(),
      },
    } as any;

    global.window = {} as any;

    documentSpy = jest.spyOn(global.document, 'createElement');
  });

  it('should create a div element and append it to body', () => {
    const { mount } = sdkWebInstallModal({
      link: 'http://example.com',
      installer: {} as any,
      i18nInstance: mockI18n,
    });

    mount('http://example-qrcode.com'); // Add this line

    expect(documentSpy).toHaveBeenCalledWith('div');
    expect(global.document.body.appendChild).toHaveBeenCalled();
  });

  it('should log debug information', () => {
    sdkWebInstallModal({
      link: 'http://example.com',
      debug: true,
      installer: {} as any,
      i18nInstance: mockI18n,
    });

    expect(spyLogger).toHaveBeenCalled();
  });

  it('should call renderSelectModal if window.extension exists', () => {
    global.window = { extension: {} } as any;

    const { mount } = sdkWebInstallModal({
      link: 'http://example.com',
      installer: {} as any,
      i18nInstance: mockI18n,
    });

    mount('http://example-qrcode.com');

    expect(modalLoaderMock.renderSelectModal).toHaveBeenCalled();
  });

  it('should call renderInstallModal if window.extension does not exist', () => {
    global.window = {} as any;

    const { mount } = sdkWebInstallModal({
      link: 'http://example.com',
      installer: {} as any,
      i18nInstance: mockI18n,
    });

    mount('http://example-qrcode.com');

    expect(modalLoaderMock.renderInstallModal).toHaveBeenCalled();
  });

  it('should return an object with mount and unmount functions', () => {
    const result = sdkWebInstallModal({
      link: 'http://example.com',
      installer: {} as any,
      i18nInstance: mockI18n,
    });

    expect(result).toHaveProperty('mount');
    expect(typeof result.mount).toBe('function');
    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
  });

  describe('mount', () => {
    it('should call renderSelectModal if window.extension exists', () => {
      global.window = { extension: {} } as any;

      const { mount } = sdkWebInstallModal({
        link: 'http://example.com',
        installer: {} as any,
        i18nInstance: mockI18n,
      });

      mount('http://example-qrcode.com');

      expect(modalLoaderMock.renderSelectModal).toHaveBeenCalled();
    });

    it('should call renderInstallModal if window.extension does not exist', () => {
      global.window = {} as any;

      const { mount } = sdkWebInstallModal({
        link: 'http://example.com',
        installer: {} as any,
        i18nInstance: mockI18n,
      });

      mount('http://example-qrcode.com');

      expect(modalLoaderMock.renderInstallModal).toHaveBeenCalled();
    });

    it('should call updateQRCode if modal is already mounted', () => {
      global.window = {
        extension: {},
      } as any;
      const { mount } = sdkWebInstallModal({
        link: 'http://example.com',
        installer: {} as any,
        i18nInstance: mockI18n,
      });

      mount('http://example-qrcode.com');
      mount('http://example-qrcode.com');

      expect(modalLoaderMock.updateQRCode).toHaveBeenCalled();
    });
  });

  describe('unmount', () => {
    it('should remove the div element from its parent', () => {
      const divMock = { parentNode: { removeChild: jest.fn() } };

      jest
        .spyOn(global.document, 'createElement')
        .mockImplementation(() => divMock as any);

      const { unmount, mount } = sdkWebInstallModal({
        link: 'http://example.com',
        installer: {} as any,
        i18nInstance: mockI18n,
      });

      mount('http://example-qrcode.com');
      unmount();

      expect(divMock.parentNode.removeChild).toHaveBeenCalledWith(divMock);
    });

    it('should log debug information', () => {
      const { unmount } = sdkWebInstallModal({
        link: 'http://example.com',
        debug: true,
        installer: {} as any,
        i18nInstance: mockI18n,
      });

      unmount();

      expect(spyLogger).toHaveBeenCalled();
    });

    it('should call terminate if shouldTerminate is true', () => {
      const terminateMock = jest.fn();

      const { unmount } = sdkWebInstallModal({
        link: 'http://example.com',
        installer: {} as any,
        terminate: terminateMock,
        i18nInstance: mockI18n,
      });

      unmount(true);

      expect(terminateMock).toHaveBeenCalled();
    });
  });
});
