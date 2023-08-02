import {
  DEFAULT_SERVER_URL,
  SendAnalytics,
  TrackingEvents,
} from '@metamask/sdk-communication-layer';

export interface AnalyticsProps {
  serverURL: string;
  debug: boolean;
  enabled?: boolean;
  metadata?: {
    url: string;
    title: string;
    platform: string;
    source: string;
  };
}

const constants = {
  DEFAULT_ID: 'sdk',
  NO_VERSION: 'NONE',
};

export class Analytics {
  #debug: boolean;

  #serverURL: string = DEFAULT_SERVER_URL;

  #enabled: boolean;

  #metadata: Readonly<AnalyticsProps['metadata']>;

  constructor(props: AnalyticsProps) {
    this.#debug = props.debug;
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
        id: constants.DEFAULT_ID,
        event,
        commLayerVersion: constants.NO_VERSION,
        originationInfo: this.#metadata,
      },
      this.#serverURL,
    ).catch((error) => {
      if (this.#debug) {
        console.error(error);
      }
    });
  }
}
