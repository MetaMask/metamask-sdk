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
  #serverURL: string = DEFAULT_SERVER_URL;

  #enabled: boolean;

  #originatorInfo: Readonly<AnalyticsProps['originationInfo']>;

  constructor({
    serverUrl,
    enabled,
    originatorInfo,
  }: {
    serverUrl: string;
    originatorInfo: AnalyticsProps['originationInfo'];
    enabled?: boolean;
  }) {
    this.#serverURL = serverUrl;
    this.#originatorInfo = originatorInfo;
    this.#enabled = enabled ?? true;
  }

  send({
    event,
    params,
  }: {
    event: TrackingEvents;
    params?: Record<string, unknown>;
  }) {
    if (!this.#enabled) {
      return;
    }

    const props: AnalyticsProps = {
      id: ANALYTICS_CONSTANTS.DEFAULT_ID,
      event,
      sdkVersion: packageJson.version,
      originationInfo: this.#originatorInfo,
      params,
    };
    logger(`[Analytics: send()] event: ${event}`, props);

    SendAnalytics(props, this.#serverURL).catch((error: unknown) => {
      logger(`[Analytics: send()] error: ${error}`);
    });
  }
}
