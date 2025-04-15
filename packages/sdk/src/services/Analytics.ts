import {
  DEFAULT_SERVER_URL,
  // TrackingEvents, // Removed - now from sdk-types
} from '@metamask/sdk-communication-layer';
import {
  SendAnalytics,
  type AnalyticsProps,
  // type OriginatorInfo, // Removed - now from sdk-types
} from '@metamask/analytics-client';
import { TrackingEvent, type OriginatorInfo } from '@metamask/sdk-types'; // Import from types package
import packageJson from '../../package.json';
import { logger } from '../utils/logger';

export const ANALYTICS_CONSTANTS = {
  DEFAULT_ID: 'sdk',
  NO_VERSION: 'NONE',
};

export class Analytics {
  private serverURL: string = DEFAULT_SERVER_URL;

  private enabled: boolean;

  private readonly originatorInfo: Readonly<OriginatorInfo>;

  constructor({
    serverUrl,
    enabled,
    originatorInfo,
  }: {
    serverUrl: string;
    originatorInfo: OriginatorInfo;
    enabled?: boolean;
  }) {
    this.serverURL = serverUrl;
    this.originatorInfo = originatorInfo;
    this.enabled = enabled ?? true;
  }

  send({
    event,
    params,
  }: {
    event: TrackingEvent;
    params?: Record<string, unknown>;
  }) {
    if (!this.enabled) {
      return;
    }

    const props: AnalyticsProps = {
      id: ANALYTICS_CONSTANTS.DEFAULT_ID,
      event,
      sdkVersion: packageJson.version,
      originatorInfo: this.originatorInfo,
      params,
    };
    logger(`[Analytics: send()] event: ${event}`, props);

    SendAnalytics(props, this.serverURL).catch((error: unknown) => {
      logger(`[Analytics: send()] error: ${error}`);
    });
  }
}
