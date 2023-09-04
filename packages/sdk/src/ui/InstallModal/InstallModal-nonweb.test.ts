import InstallModal from './InstallModal-nonweb';

describe('InstallModal-nonweb', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  it('should log INSTALL MODAL along with the link', () => {
    const mockLink = 'http://example.com';

    InstallModal({ link: mockLink });

    expect(consoleLogSpy).toHaveBeenCalledWith('INSTALL MODAL', mockLink);
  });

  it('should return an object with unmount function', () => {
    const result = InstallModal({ link: 'http://example.com' });

    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
  });
});
