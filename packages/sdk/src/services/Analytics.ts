import {
  DEFAULT_SERVER_URL,
  SendAnalytics,
  AnalyticsProps,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import packageJson from '../../package.json';

export const ANALYTICS_CONSTANTS = {
  DEFAULT_ID: 'sdk',
  NO_VERSION: 'NONE',
};

export class Analytics {
  private serverURL: string = DEFAULT_SERVER_URL;

  private enabled: boolean;

  private readonly originatorInfo: Readonly<AnalyticsProps['originatorInfo']>;

  constructor({
    serverUrl,
    enabled,
    originatorInfo,
  }: {
    serverUrl: string;
    originatorInfo: AnalyticsProps['originatorInfo'];
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
    event: TrackingEvents;
    params?: Record<string, unknown>;
  }) {
    if (!this.enabled) {
      return;
    }

    const props: AnalyticsProps = {
      id: ANALYTICS_CONSTANTS.DEFAULT_ID,
      event,
      sdkVersion: packageJson.version,
      ...this.originatorInfo,
      params,
    };
    logger(`[Analytics: send()] event: ${event}`, props);

    SendAnalytics(props, this.serverURL).catch((error: unknown) => {
      logger(`[Analytics: send()] error: ${error}`);
    });
  }
}
