import createClient from 'openapi-fetch';
import * as schema from './schema';

// FIXME add exp backoff on failed requests

export class AnalyticsClient {
  private enabled: boolean = false;

  private client: ReturnType<typeof createClient<schema.paths>> | null = null;

  private batchSize: number = 100;
  private batchIntervalMs: number = 200;
  private batchIntervalId: NodeJS.Timeout | null = null;

  private events: schema.components['schemas']['Event'][] = [];
  private properties: Record<string, string> = {};

  constructor(baseUrl: string) {
    this.client = createClient<schema.paths>({ baseUrl });
  }

  private startSendingInterval() {
    if (this.batchIntervalId) {
      clearInterval(this.batchIntervalId);
    }

    this.batchIntervalId = setInterval(() => {
      this.send();
    }, this.batchIntervalMs);
  }

  private async send() {
    if (!this.enabled || !this.client || this.events.length === 0) return;

    const body = [...this.events];
    this.events = [];

    try {
      const res = await this.client.POST('/v1/events', { body });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    } catch (error) {
      console.error('Failed to send events', error);
      this.events = [...body, ...this.events]; // put the events back in the queue
    }
  }

  public enable() {
    this.enabled = true;
    this.startSendingInterval();
  }

  public setGlobalProperty(key: string, value: string) {
    this.properties[key] = value;
  }

  public track<T extends schema.components['schemas']['Event']>(name: T['name'], properties: Partial<T>) {
    if (!this.enabled) return;

    const event: schema.components['schemas']['Event'] = {
      name: name,
      ...this.properties,
      ...properties
    } as T;

    this.events.push(event);

    // if we've hit the batch size limit, send immediately
    if (this.events.length >= this.batchSize) this.send();
  }
}
