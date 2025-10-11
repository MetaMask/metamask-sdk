/* eslint-disable no-restricted-syntax */

import createClient from 'openapi-fetch';

import type * as schema from './schema';
import Sender from './sender';

type Paths = schema.paths;
type EventV1 = schema.components['schemas']['Event'];
type EventV2 = schema.components['schemas']['EventV2'];

type Namespaces = EventV2['namespace'];
type EventPayloadForNamespace<T extends Namespaces> = Extract<
  EventV2,
  { namespace: T }
>;
type EventNameForNamespace<T extends Namespaces> =
  EventPayloadForNamespace<T>['event_name'];
type PropertiesForEvent<
  TNs extends Namespaces,
  TEv extends EventNameForNamespace<TNs>,
> = Extract<EventPayloadForNamespace<TNs>, { event_name: TEv }>['properties'];

type PropertiesForNamespace<T extends Namespaces> = Extract<
  EventV2,
  { namespace: T }
>['properties'];

type SetupPropertiesForNamespace<T extends Namespaces> = Partial<
  PropertiesForNamespace<T>
>;

type TrackPropertiesForEvent<TNs extends Namespaces> = Partial<
  PropertiesForNamespace<TNs>
>;

class AnalyticsV1 {
  private readonly sender: Sender<EventV1>;

  private readonly enabled: () => boolean;

  private properties: Record<string, string> = {};

  constructor(baseUrl: string, enabled: () => boolean) {
    this.enabled = enabled;

    const client = createClient<Paths>({ baseUrl });

    const sendFn = async (batch: EventV1[]): Promise<void> => {
      const res = await client.POST('/v1/events', { body: batch });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    };

    this.sender = new Sender({ batchSize: 100, baseTimeoutMs: 200, sendFn });
  }

  /**
   * Sets a global property to be included in all V1 events.
   *
   * @param key - The property key.
   * @param value - The property value.
   */
  public setGlobalProperty(key: string, value: string): void {
    this.properties[key] = value;
  }

  /**
   * Tracks a V1 analytics event if enabled.
   *
   * @param name - The name of the event.
   * @param properties - Additional properties for the event.
   */
  public track<T extends EventV1>(
    name: T['name'],
    properties: Partial<T>,
  ): void {
    if (!this.enabled()) {
      return;
    }

    const event = {
      name,
      ...this.properties,
      ...properties,
    } as T;

    this.sender.enqueue(event);
  }
}

class AnalyticsV2 {
  private readonly sender: Sender<EventV2>;

  private readonly enabled: () => boolean;

  private readonly namespaceConfigs: Map<
    Namespaces,
    { properties: Record<string, unknown> }
  > = new Map();

  constructor(baseUrl: string, enabled: () => boolean) {
    this.enabled = enabled;

    const client = createClient<Paths>({ baseUrl });

    const sendFn = async (batch: EventV2[]): Promise<void> => {
      const res = await client.POST('/v2/events', { body: batch });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    };

    this.sender = new Sender({ batchSize: 100, baseTimeoutMs: 200, sendFn });
  }

  /**
   * Configures common properties for a specific V2 namespace.
   * Merges with any existing properties for the namespace.
   *
   * @param namespace - The namespace to configure.
   * @param properties - Common properties to include in all events for this namespace.
   */
  public setup<TNs extends Namespaces>(
    namespace: TNs,
    properties: SetupPropertiesForNamespace<TNs>,
  ): void {
    const existing = this.namespaceConfigs.get(namespace)?.properties ?? {};
    this.namespaceConfigs.set(namespace, {
      properties: { ...existing, ...properties },
    });
  }

  /**
   * Tracks a V2 namespaced analytics event if enabled.
   *
   * @param namespace - The namespace of the event.
   * @param eventName - The name of the event.
   * @param properties - Additional properties for the event.
   */
  public track<TNs extends Namespaces>(
    namespace: TNs,
    eventName: EventNameForNamespace<TNs>,
    properties: TrackPropertiesForEvent<TNs>,
  ): void {
    if (!this.enabled()) {
      return;
    }

    const config = this.namespaceConfigs.get(namespace);
    if (!config) {
      throw new Error(
        `No configuration found for namespace: "${namespace}". Make sure to call setup() first.`,
      );
    }

    const merged = {
      ...config.properties,
      ...properties,
    } as unknown as PropertiesForEvent<TNs, typeof eventName>;

    const event = {
      namespace,
      event_name: eventName,
      properties: merged,
    } as EventV2;

    this.sender.enqueue(event);
  }
}

class Analytics {
  private enabled = false;

  public readonly v1: AnalyticsV1;

  public readonly v2: AnalyticsV2;

  constructor(baseUrl: string) {
    this.v1 = new AnalyticsV1(baseUrl, () => this.enabled);
    this.v2 = new AnalyticsV2(baseUrl, () => this.enabled);
  }

  public enable(): void {
    this.enabled = true;
  }
}

export default Analytics;
