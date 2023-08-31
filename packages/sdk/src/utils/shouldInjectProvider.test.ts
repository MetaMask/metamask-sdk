import { shouldInjectProvider } from './shouldInjectProvider';
import { suffixCheck } from './suffixCheck';
import { doctypeCheck } from './doctypeCheck';
import { documentElementCheck } from './documentElementCheck';
import { blockedDomainCheck } from './blockedDomainCheck';

jest.mock('./suffixCheck');
jest.mock('./doctypeCheck');
jest.mock('./documentElementCheck');
jest.mock('./blockedDomainCheck');

describe('shouldInjectProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (suffixCheck as jest.Mock).mockReturnValue(true);
    (doctypeCheck as jest.Mock).mockReturnValue(true);
    (documentElementCheck as jest.Mock).mockReturnValue(true);
    (blockedDomainCheck as jest.Mock).mockReturnValue(false);

    global.window = {
      ethereum: {},
    } as any;
  });

  it('should return true if window is undefined', () => {
    global.window = {} as any;

    expect(shouldInjectProvider()).toBe(true);
  });

  it('should return true if window is defined but window.ethereum is undefined', () => {
    global.window = {
      ethereum: undefined,
    } as any;

    expect(shouldInjectProvider()).toBe(true);
  });

  it('should return true if all checks pass', () => {
    global.window = {
      ethereum: undefined,
    } as any;

    (suffixCheck as jest.Mock).mockReturnValue(true);
    (doctypeCheck as jest.Mock).mockReturnValue(true);
    (documentElementCheck as jest.Mock).mockReturnValue(true);
    (blockedDomainCheck as jest.Mock).mockReturnValue(false);

    expect(shouldInjectProvider()).toBe(true);
  });

  it('should return false if doctypeCheck fails', () => {
    (doctypeCheck as jest.Mock).mockReturnValue(false);

    expect(shouldInjectProvider()).toBe(false);
  });

  it('should return false if suffixCheck fails', () => {
    (doctypeCheck as jest.Mock).mockReturnValue(true);
    (suffixCheck as jest.Mock).mockReturnValue(false);

    expect(shouldInjectProvider()).toBe(false);
  });

  it('should return false if documentElementCheck fails', () => {
    (doctypeCheck as jest.Mock).mockReturnValue(true);
    (suffixCheck as jest.Mock).mockReturnValue(true);
    (documentElementCheck as jest.Mock).mockReturnValue(false);

    expect(shouldInjectProvider()).toBe(false);
  });

  it('should return false if blockedDomainCheck fails', () => {
    (doctypeCheck as jest.Mock).mockReturnValue(true);
    (suffixCheck as jest.Mock).mockReturnValue(true);
    (documentElementCheck as jest.Mock).mockReturnValue(true);
    (blockedDomainCheck as jest.Mock).mockReturnValue(true);

    expect(shouldInjectProvider()).toBe(false);
  });
});
