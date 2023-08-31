import { generate } from 'qrcode-terminal';
import InstallModal from './InstallModal-nodejs';

jest.mock('qrcode-terminal', () => ({
  generate: jest.fn((_, __, callback) => callback('Mocked QR Code')),
}));

describe('InstallModal-nodejs', () => {
  let consoleLogSpy: jest.SpyInstance;
  const mockGenerate = generate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    global.document = {
      createElement: jest.fn(),
      body: {
        appendChild: jest.fn(),
      },
    } as any;
  });

  it('should call qrcode.generate with correct parameters', () => {
    const mockLink = 'http://example.com';

    InstallModal({ link: mockLink });

    expect(mockGenerate).toHaveBeenCalledWith(
      mockLink,
      { small: true },
      expect.any(Function),
    );
  });

  it('should log the QR code to the console', () => {
    InstallModal({ link: 'http://example.com' });

    expect(consoleLogSpy).toHaveBeenCalledWith('Mocked QR Code');
  });

  it('should log the QR code URL to the console', () => {
    const mockLink = 'http://example.com';

    InstallModal({ link: mockLink });

    expect(consoleLogSpy).toHaveBeenCalledWith('qrcode url: ', mockLink);
  });

  it('should return an object with unmount function', () => {
    const result = InstallModal({ link: 'http://example.com' });

    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
  });
});
