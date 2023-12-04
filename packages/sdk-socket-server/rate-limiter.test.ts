import {
  resetRateLimits,
  increaseRateLimits,
  setLastConnectionErrorTimestamp,
} from './rate-limiter';

import os from 'os';

jest.mock('os');

describe('rate-limiter', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules(); // Clear any cached modules, which includes the rateLimiter instances.
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('resetRateLimits should reset rate limits', () => {
    setLastConnectionErrorTimestamp(Date.now() - 10001);
    resetRateLimits();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO> RL points:'),
    );
  });

  it('increaseRateLimits should adjust rate limits based on system load', () => {
    (os.loadavg as jest.Mock).mockReturnValue([0.5, 0.5, 0.5]);
    (os.cpus as jest.Mock).mockReturnValue(new Array(4));
    (os.totalmem as jest.Mock).mockReturnValue(10000000);
    (os.freemem as jest.Mock).mockReturnValue(5000000);
    increaseRateLimits(50);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('INFO> RL points:'),
    );
  });
});
