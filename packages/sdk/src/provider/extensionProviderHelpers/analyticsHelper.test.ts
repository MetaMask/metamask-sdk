import { analytics } from '@metamask/sdk-analytics';
import { isAnalyticsTrackedRpcMethod } from '@metamask/sdk-communication-layer';
import { trackRpcOutcome } from './analyticsHelper';

jest.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    track: jest.fn(),
  },
}));

jest.mock('@metamask/sdk-communication-layer', () => ({
  isAnalyticsTrackedRpcMethod: jest.fn(),
}));

describe('trackRpcOutcome', () => {
  const mockTrack = analytics.track as jest.Mock;
  const mockIsAnalyticsTrackedRpcMethod =
    isAnalyticsTrackedRpcMethod as jest.Mock;

  beforeEach(() => {
    mockTrack.mockClear();
    mockIsAnalyticsTrackedRpcMethod.mockClear();
  });

  it('should not track if method is not analytics tracked', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(false);
    trackRpcOutcome('some_method', {}, null);
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('should track sdk_action_succeeded for successful calls', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    trackRpcOutcome('tracked_method', { result: 'success' }, null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_rejected for user rejected errors (caughtError)', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const error = { code: 4001, message: 'User rejected' };
    trackRpcOutcome('tracked_method', null, error);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_rejected', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_failed for other errors (caughtError)', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const error = { code: 5000, message: 'Internal error' };
    trackRpcOutcome('tracked_method', null, error);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_failed', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_rejected for user rejected errors (response error)', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const response = { error: { code: 4001, message: 'User rejected' } };
    trackRpcOutcome('tracked_method', response, null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_rejected', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_failed for other errors (response error)', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const response = { error: { code: 5000, message: 'Internal error' } };
    trackRpcOutcome('tracked_method', response, null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_failed', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_succeeded when resp is null and no caughtError', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    trackRpcOutcome('tracked_method', null, null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_succeeded when resp is not an object and no caughtError', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    trackRpcOutcome('tracked_method', 'a string response', null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_succeeded', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_failed when caughtError is present but errorObj has no code', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const error = { message: 'Some error without a code' };
    trackRpcOutcome('tracked_method', null, error);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_failed', {
      action: 'tracked_method',
    });
  });

  it('should track sdk_action_failed when resp.error is present but errorObj has no code', () => {
    mockIsAnalyticsTrackedRpcMethod.mockReturnValue(true);
    const response = { error: { message: 'Some error without a code' } };
    trackRpcOutcome('tracked_method', response, null);
    expect(mockTrack).toHaveBeenCalledWith('sdk_action_failed', {
      action: 'tracked_method',
    });
  });
});
