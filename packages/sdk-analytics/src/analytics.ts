import createClient from 'openapi-fetch';
import * as schema from './schema';
import Sender from './sender';

type Event = schema.components['schemas']['Event'];

class Analytics {
  private enabled: boolean = false;
  private sender: Sender<Event>;
  private properties: Record<string, string> = {};

  constructor(baseUrl: string) {
    const client = createClient<schema.paths>({ baseUrl });

    const sendFn = async (batch: Event[]) => {
      const res = await client.POST('/v1/events', { body: batch });
      if (res.response.status !== 200) {
        throw new Error(res.error);
      }
    };

    this.sender = new Sender({ batchSize: 100, baseIntervalMs: 200, sendFn });
  }

  public enable() {
    if (this.enabled) return;
    this.enabled = true;
    this.sender.start();
  }

  public setGlobalProperty(key: string, value: string) {
    this.properties[key] = value;
  }

  public track<T extends Event>(name: T['name'], properties: Partial<T>) {
    if (!this.enabled) return;

    const event: Event = {
      name: name,
      ...this.properties,
      ...properties,
    } as T;

    this.sender.enqueue(event);
  }
}

export default Analytics;
