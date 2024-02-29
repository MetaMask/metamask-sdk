import * as loggerModule from '../../utils/logger';
import InstallModal from './InstallModal-nonweb';

describe('InstallModal-nonweb', () => {
  let logger: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = jest.spyOn(loggerModule, 'logger').mockImplementation();
  });

  it('should log INSTALL MODAL along with the link', () => {
    const mockLink = 'http://example.com';

    InstallModal({ link: mockLink });

    expect(logger).toHaveBeenCalledWith(
      `[UI: InstallModal-nonweb()] INSTALL MODAL link=${mockLink}`,
    );
  });

  it('should return an object with unmount function', () => {
    const result = InstallModal({ link: 'http://example.com' });

    expect(result).toHaveProperty('unmount');
    expect(typeof result.unmount).toBe('function');
  });
});
