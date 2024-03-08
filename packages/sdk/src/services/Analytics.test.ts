import {
  SendAnalytics,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import * as loggerModule from '../utils/logger';
import { Analytics, AnalyticsProps } from './Analytics'; // Replace with your actual import path

jest.mock('@metamask/sdk-communication-layer');

const mockSendAnalytics = SendAnalytics as jest.Mock;

describe('Analytics', () => {
  let props: AnalyticsProps;
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendAnalytics.mockResolvedValue(undefined);

    props = {
      serverURL: 'https://test.server.url',
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
        mockSendAnalytics.mockRejectedValue(new Error('Send failed'));

        const analytics = new Analytics({ ...props });
        const event: TrackingEvents = TrackingEvents.AUTHORIZED;

        await analytics.send({ event });

        expect(spyLogger).toHaveBeenCalledWith(
          '[Analytics: send()] error: Error: Send failed',
        );
      });
    });
  });
});
