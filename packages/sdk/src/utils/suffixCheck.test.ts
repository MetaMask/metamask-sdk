import { suffixCheck } from './suffixCheck';

describe('suffixCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.window = {
      location: {
        pathname: '/some/path',
      },
    } as any;
  });

  it('should return true if window.location is undefined', () => {
    global.window = {} as any;

    expect(suffixCheck()).toBe(true);
  });

  it('should return false if the URL ends with a prohibited extension', () => {
    const prohibitedExtensions = ['.xml', '.pdf'];

    prohibitedExtensions.forEach((ext) => {
      global.window.location.pathname = `/some/path${ext}`;
      expect(suffixCheck()).toBe(false);
    });
  });

  it('should return true if the URL does not end with a prohibited extension', () => {
    const allowedExtensions = ['', '.html', '.jpg'];

    allowedExtensions.forEach((ext) => {
      global.window.location.pathname = `/some/path${ext}`;
      expect(suffixCheck()).toBe(true);
    });
  });
});
