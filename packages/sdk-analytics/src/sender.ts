/* eslint-disable no-restricted-syntax */
type SenderOptions<T> = {
  batchSize: number;
  baseTimeoutMs: number;
  sendFn: (batch: T[]) => Promise<void>;
};

/**
 * Sender batches events and sends them to a server within a time window,
 * with exponential backoff on errors.
 */
class Sender<T> {
  private readonly sendFn: (batch: T[]) => Promise<void>;

  private batch: T[] = [];

  private readonly batchSize: number;

  private readonly baseTimeoutMs: number;

  private currentTimeoutMs: number;

  private readonly maxTimeoutMs: number = 30_000;

  private timeoutId: NodeJS.Timeout | null = null;

  private isSending: boolean = false;

  constructor(options: SenderOptions<T>) {
    this.batchSize = options.batchSize;
    this.baseTimeoutMs = options.baseTimeoutMs;
    this.currentTimeoutMs = options.baseTimeoutMs;
    this.sendFn = options.sendFn;
  }

  public enqueue(item: T): void {
    this.batch.push(item);
    this.schedule();
  }

  private schedule(): void {
    // If the batch is not full and there is no scheduled flush, schedule a flush
    if (this.batch.length > 0 && !this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.flush();
      }, this.currentTimeoutMs);
    }
  }

  private async flush(): Promise<void> {
    if (this.isSending || this.batch.length === 0) {
      return;
    }

    this.isSending = true;
    const current = [...this.batch.slice(0, this.batchSize)];
    this.batch = this.batch.slice(this.batchSize);

    try {
      await this.sendFn(current);
      this.currentTimeoutMs = this.baseTimeoutMs; // reset on success
    } catch (error) {
      console.error('Sender: Failed to send batch', error);
      this.batch = [...current, ...this.batch]; // retry the batch
      this.currentTimeoutMs = Math.min(
        this.currentTimeoutMs * 2,
        this.maxTimeoutMs,
      ); // exponential backoff
    } finally {
      this.isSending = false;
      this.schedule();
    }
  }
}

export default Sender;
