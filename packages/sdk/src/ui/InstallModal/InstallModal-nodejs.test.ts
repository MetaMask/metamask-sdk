import { generate } from 'qrcode-terminal-nooctal';
import * as loggerModule from '../../utils/logger';
import InstallModal from './InstallModal-nodejs';

jest.mock('qrcode-terminal-nooctal', () => ({
  generate: jest.fn((_, __, callback) => callback('Mocked QR Code')),
}));

describe('InstallModal-nodejs', () => {
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  const mockGenerate = generate as jest.Mock;

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
      { small: true },
      expect.any(Function),
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
