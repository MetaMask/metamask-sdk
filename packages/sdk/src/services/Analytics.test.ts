import {
  SendAnalytics,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import { Analytics, AnalyticsProps } from './Analytics'; // Replace with your actual import path

jest.mock('@metamask/sdk-communication-layer');

const mockSendAnalytics = SendAnalytics as jest.Mock;

describe('Analytics', () => {
  let props: AnalyticsProps;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendAnalytics.mockResolvedValue(undefined);

    props = {
      serverURL: 'https://test.server.url',
      debug: false,
      metadata: {
        url: 'https://test.url',
        title: 'Test Title',
        platform: 'web',
        source: 'test-source',
      },
    };
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const analytics = new Analytics(props);
      expect(analytics).toBeDefined();
    });

    it('should initialize with custom values', () => {
      const customProps: AnalyticsProps = {
        ...props,
        enabled: true,
        debug: true,
      };
      const analytics = new Analytics(customProps);
      expect(analytics).toBeDefined();
    });
  });

  describe('send()', () => {
    it('should send analytics when enabled', () => {
      const analytics = new Analytics({ ...props, enabled: true });
      const event: TrackingEvents = TrackingEvents.AUTHORIZED;
      analytics.send({ event });
      expect(mockSendAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          event,
        }),
        props.serverURL,
      );
    });

    it('should not send analytics when disabled', () => {
      const analytics = new Analytics({ ...props, enabled: false });
      const event: TrackingEvents = TrackingEvents.AUTHORIZED;
      analytics.send({ event });
      expect(mockSendAnalytics).not.toHaveBeenCalled();
    });

    describe('Error Handling', () => {
      it('should log error when debug is true', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSendAnalytics.mockRejectedValue(new Error('Send failed'));

        const analytics = new Analytics({ ...props, debug: true });
        const event: TrackingEvents = TrackingEvents.AUTHORIZED;

        await analytics.send({ event });

        expect(consoleSpy).toHaveBeenCalled();
      });

      it('should not log error when debug is false', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSendAnalytics.mockRejectedValue(new Error('Send failed'));

        const analytics = new Analytics({ ...props, debug: false });
        const event: TrackingEvents = TrackingEvents.AUTHORIZED;

        await analytics.send({ event });

        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });
  });
});
