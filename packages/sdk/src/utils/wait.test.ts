import { wait } from './wait';

describe('wait function', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const mockCallback = jest.fn();

    const promise = wait(500).then(mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    await promise;

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should resolve with true', async () => {
    const promise = wait(500);

    jest.advanceTimersByTime(500);

    const result = await promise;
    expect(result).toBe(true);
  });
});
