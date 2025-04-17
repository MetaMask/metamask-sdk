import createClient from 'openapi-fetch';
import { components, paths } from './schema';
import { type OriginatorInfo } from '@metamask/sdk-types';

type AnalyticsClientOptions = {
    // TODO Add options 
    pushInterval: number;
    analyticsUrl: string;
};

class AnalyticsClient {
    private _options: AnalyticsClientOptions | undefined = undefined;
    private _pushInterval: NodeJS.Timeout | undefined = undefined;
    private _client: ReturnType<typeof createClient> | undefined = undefined;
    private _events: components['schemas']['Event'][] = [];

    public init(options?: AnalyticsClientOptions) {
        if (!options) {
            options = {
                pushInterval: 1000,
                analyticsUrl: 'http://localhost:3000',
            };
        }

        if (this.isInitialized) {
            // Nothing to do
            return;
        }

        this._options = options;

        this._client = createClient<paths>({
            baseUrl: this._options.analyticsUrl,
        });

        this._pushInterval = setInterval(() => {
            this.pushEvents();
        }, this._options.pushInterval);
    }

    public get isInitialized() {
        return this._options !== undefined && this._pushInterval !== undefined && this._client !== undefined;
    }

    private checkInitialized() {
        if (!this.isInitialized) {
            throw new Error('Analytics client is not initialized');
        }
    }

    private useClient(): ReturnType<typeof createClient<paths>> {
        this.checkInitialized();
        return this._client as ReturnType<typeof createClient<paths>>;
    }

    private async pushEvents() {
        if (this._events.length === 0) {
            return;
        }

        const client = this.useClient();


        const events = this._events as components['schemas']['Event'][];
        this._events = [];

        const result = await client.POST("/v1/events", {
            body: events,
        });

        if (!result.data) {
            throw new Error(`Failed to post request_initiated event: ${result.error}`);
        }
    }

    public trackEvent<T extends components['schemas']['Event']>(event: T) {
        this._events.push(event);
    }
}

const GlobalAnalyticsClient = new AnalyticsClient();

export type BaseAnalyticsProps = {
    id: string;
    originatorInfo?: OriginatorInfo; // Now uses local type
    sdkVersion?: string;
    // TODO What is this?
    anonId: string;
};

export type AnalyticsProps = BaseAnalyticsProps & AnalyticsClientOptions;

let globalAnalyticsProps: BaseAnalyticsProps | undefined = undefined;

export function initAnalyticsClient(options?: AnalyticsProps) {
    globalAnalyticsProps = options;
    GlobalAnalyticsClient.init(options);
}

export function trackEvent<T extends components['schemas']['Event']>(event: T | Partial<T>) {
    if (!globalAnalyticsProps) {
        throw new Error('Analytics client is not initialized');
    }

    const baseEventProps = {
        sdk_version: globalAnalyticsProps.sdkVersion,
        dapp_id: globalAnalyticsProps.originatorInfo?.dappId,
        anon_id: globalAnalyticsProps.anonId,
        platform: globalAnalyticsProps.originatorInfo?.platform,
        integration_type: globalAnalyticsProps.originatorInfo?.source,
    }

    const mergedEvent = {
        ...baseEventProps,
        ...event,
    } as T;

    GlobalAnalyticsClient.trackEvent(mergedEvent);
}

export default GlobalAnalyticsClient;