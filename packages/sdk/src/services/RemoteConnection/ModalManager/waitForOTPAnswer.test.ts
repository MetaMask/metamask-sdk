import { RemoteConnectionState } from '../RemoteConnection';
import { waitForOTPAnswer } from './waitForOTPAnswer';

describe('waitForOTPAnswer', () => {
  let state: RemoteConnectionState;

  beforeEach(() => {
    jest.useFakeTimers();
    state = {
      otpAnswer: undefined,
    } as unknown as RemoteConnectionState;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return immediately if otpAnswer is already defined', async () => {
    state.otpAnswer = '123456';
    const result = await waitForOTPAnswer(state);
    expect(result).toBe('123456');
  });

  it('should wait for otpAnswer to be defined if initially undefined', async () => {
    setTimeout(() => {
      state.otpAnswer = '654321';
    }, 5000);

    const promise = waitForOTPAnswer(state);

    jest.advanceTimersByTime(4000);
    await Promise.resolve();

    expect(state.otpAnswer).toBeUndefined();

    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    const result = await promise;
    expect(result).toBe('654321');
  });
});
