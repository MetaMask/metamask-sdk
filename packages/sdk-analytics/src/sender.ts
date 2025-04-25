type SenderOptions<T> = {
  batchSize: number;
  baseIntervalMs: number;
  sendFn: (batch: T[]) => Promise<void>;
};

/**
 * Sender is a class that sends batches of events to the server in an interval.
 * It also uses exponential backoff to handle errors.
 */
class Sender<T> {
  private sendFn: (batch: T[]) => Promise<void>;

  private batch: T[] = [];

  private batchSize: number;
  private baseIntervalMs: number;
  private currentIntervalMs: number;
  private maxIntervalMs: number = 30_000; // 30 seconds

  private intervalId: NodeJS.Timeout | null = null;

  private isSending: boolean = false;

  constructor(options: SenderOptions<T>) {
    this.batchSize = options.batchSize;
    this.baseIntervalMs = options.baseIntervalMs;
    this.currentIntervalMs = options.baseIntervalMs;
    this.sendFn = options.sendFn;
  }

  public enqueue(item: T) {
    this.batch.push(item);
    if (this.batch.length >= this.batchSize && !this.isSending) {
      this.flush();
    }
  }

  public start() {
    if (this.intervalId) return;
    this.scheduleNextSend();
  }

  private scheduleNextSend() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
    this.intervalId = setTimeout(() => this.flush(), this.currentIntervalMs);
  }

  private async flush() {
    if (this.isSending || this.batch.length === 0) return;

    this.isSending = true;

    const current = [...this.batch];

    this.batch = [];

    try {
      await this.sendFn(current);
      this.currentIntervalMs = this.baseIntervalMs; // reset on success
    } catch {
      this.batch = [...current, ...this.batch];
      this.currentIntervalMs = Math.min(this.currentIntervalMs * 2, this.maxIntervalMs); // exponential backoff on error
    } finally {
      this.isSending = false;
      this.scheduleNextSend();
    }
  }
}

export default Sender;
