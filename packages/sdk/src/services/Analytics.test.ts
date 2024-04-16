import {
  SendAnalytics,
  TrackingEvents,
  AnalyticsProps,
} from '@metamask/sdk-communication-layer';
import * as loggerModule from '../utils/logger';
import { Analytics } from './Analytics';
// Replace with your actual import path
jest.mock('@metamask/sdk-communication-layer');

const mockSendAnalytics = SendAnalytics as jest.Mock;
interface Props {
  serverUrl: string;
  originatorInfo: AnalyticsProps['originationInfo'];
  enabled?: boolean;
}

describe('Analytics', () => {
  let props: {
    serverUrl: string;
    originatorInfo: AnalyticsProps['originationInfo'];
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
      const event: TrackingEvents = TrackingEvents.AUTHORIZED;
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
