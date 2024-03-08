import {
  DEFAULT_SERVER_URL,
  SendAnalytics,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';
import { logger } from '../utils/logger';
import packageJson from '../../package.json';

export interface AnalyticsProps {
  serverURL: string;
  enabled?: boolean;
  metadata?: {
    url: string;
    title: string;
    platform: string;
    source: string;
  };
}

export const ANALYTICS_CONSTANTS = {
  DEFAULT_ID: 'sdk',
  NO_VERSION: 'NONE',
};

export class Analytics {
  #serverURL: string = DEFAULT_SERVER_URL;

  #enabled: boolean;

  #metadata: Readonly<AnalyticsProps['metadata']>;

  constructor(props: AnalyticsProps) {
    this.#serverURL = props.serverURL;
    this.#metadata = props.metadata || undefined;
    this.#enabled = props.enabled ?? true;
  }

  send({ event }: { event: TrackingEvents }) {
    if (!this.#enabled) {
      return;
    }

    SendAnalytics(
      {
        id: ANALYTICS_CONSTANTS.DEFAULT_ID,
        event,
        sdkVersion: packageJson.version,
        commLayerVersion: ANALYTICS_CONSTANTS.NO_VERSION,
        originationInfo: this.#metadata,
      },
      this.#serverURL,
    ).catch((error) => {
      logger(`[Analytics: send()] error: ${error}`);
    });
  }
}
