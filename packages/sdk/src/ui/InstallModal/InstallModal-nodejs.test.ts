import encodeQR from '@paulmillr/qr';
import * as loggerModule from '../../utils/logger';
import InstallModal from './InstallModal-nodejs';

jest.mock('@paulmillr/qr', () => (jest.fn((_, __) => 'Mocked QR Code')));

describe('InstallModal-nodejs', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const mockGenerate = encodeQR as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

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
      'ascii'
    );
  });

  it('should log the QR code link', () => {
    const link = 'http://example.com';
    InstallModal({ link });

    expect(spyLogger).toHaveBeenCalledWith(
      `[UI: InstallModal-nodejs()] qrcode url: ${link}`,
    );
  });

  it('should return an object with unmount function', () => {
    const result = InstallModal({ link: 'http://example.com' });

    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
  });
});
