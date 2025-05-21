/* eslint-disable no-restricted-syntax */
import createClient from 'openapi-fetch';

import type * as schema from './schema';
import Sender from './sender';

type Event = schema.components['schemas']['Event'];

class Analytics {
  private enabled = false;

  private readonly sender: Sender<Event>;

  private properties: Record<string, string> = {};

  constructor(baseUrl: string) {
    const client = createClient<schema.paths>({ baseUrl });

    const sendFn = async (batch: Event[]): Promise<void> => {
      const res = await client.POST('/v1/events', { body: batch });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    };

    this.sender = new Sender({ batchSize: 100, baseTimeoutMs: 200, sendFn });
  }

  public enable(): void {
    this.enabled = true;
  }

  public setGlobalProperty(key: string, value: string): void {
    this.properties[key] = value;
  }

  public track<T extends Event>(name: T['name'], properties: Partial<T>): void {
    if (!this.enabled) {
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

export default Analytics;
