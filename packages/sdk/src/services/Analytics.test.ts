import { SendAnalytics } from '@metamask/analytics-client'; // Removed unused AnalyticsProps
import {
  type OriginatorInfo,
  TrackingEvents,
  type TrackingEvent,
} from '@metamask/sdk-types'; // Use types package, import OriginatorInfo
import * as loggerModule from '../utils/logger';
import { Analytics } from './Analytics';
// Replace with your actual import path
jest.mock('@metamask/analytics-client', () => ({
  SendAnalytics: jest.fn(),
}));

const mockSendAnalytics = SendAnalytics as jest.Mock;
interface Props {
  serverUrl: string;
  originatorInfo: OriginatorInfo; // Use OriginatorInfo directly
  enabled?: boolean;
}

describe('Analytics', () => {
  let props: {
    serverUrl: string;
    originatorInfo: OriginatorInfo; // Use OriginatorInfo directly
    enabled?: boolean;
  };
  const spyLogger = jest.spyOn(loggerModule, 'logger');

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendAnalytics.mockResolvedValue(undefined);

    props = {
      serverUrl: 'https://custom.server.url',
      originatorInfo: {
        url: 'https://dapp.url',
        title: 'DApp Name',
        platform: 'web',
        source: 'custom-source',
        dappId: 'dapp-id',
      },
    };
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const analytics = new Analytics(props);
      expect(analytics).toBeDefined();
    });

    it('should initialize with custom values', () => {
      const customProps: Props = {
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
      const event: TrackingEvent = TrackingEvents.AUTHORIZED; // Use type TrackingEvent
      analytics.send({ event });
      expect(mockSendAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          event,
        }),
        props.serverUrl,
      );
    });

    it('should not send analytics when disabled', () => {
      const analytics = new Analytics({ ...props, enabled: false });
      const event: TrackingEvent = TrackingEvents.AUTHORIZED; // Use type TrackingEvent
      analytics.send({ event });
      expect(mockSendAnalytics).not.toHaveBeenCalled();
    });

    describe('Error Handling', () => {
      it('should log error when debug is true', async () => {
        mockSendAnalytics.mockRejectedValue(new Error('Send failed'));

        const analytics = new Analytics({ ...props });
        const event: TrackingEvent = TrackingEvents.AUTHORIZED; // Use type TrackingEvent

        await analytics.send({ event });

        expect(spyLogger).toHaveBeenCalledWith(
          '[Analytics: send()] error: Error: Send failed',
        );
      });
    });
  });
});
