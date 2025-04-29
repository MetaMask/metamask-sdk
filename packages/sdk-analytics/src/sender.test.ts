/* eslint-disable-next-line id-length */
import * as t from 'vitest';

import Sender from './sender';

t.describe('Sender', () => {
  let sendFn: t.Mock<() => Promise<void>>;
  let sender: Sender<string>;

  t.beforeEach(() => {
    sendFn = t.vi.fn().mockResolvedValue(undefined);
    sender = new Sender({ batchSize: 2, baseIntervalMs: 50, sendFn });
  });

  t.afterEach(() => {
    t.vi.clearAllMocks();
  });

  t.it('should flush when batch size is reached', async () => {
    sender.start();
    sender.enqueue('event1');
    sender.enqueue('event2');
    t.expect(sendFn).toHaveBeenCalledWith(['event1', 'event2']); // Flush at batchSize
  });

  t.it('should flush periodically', async () => {
    sender.start();
    sender.enqueue('event1');
    await new Promise((resolve) => setTimeout(resolve, 100));
    t.expect(sendFn).toHaveBeenCalledWith(['event1']);
  });

  t.it(
    'should handle failure and reset interval after successful send',
    async () => {
      let sendCount = 0;
      sendFn = t.vi.fn().mockImplementation(async () => {
        sendCount += 1;
        return sendCount === 1
          ? Promise.reject(new Error('Failed'))
          : Promise.resolve();
      });
      sender = new Sender({ batchSize: 100, baseIntervalMs: 50, sendFn }); // Short interval
      sender.start();

      sender.enqueue('event1');
      t.expect(sendFn).toHaveBeenCalledTimes(0);

      // Wait for initial send
      await new Promise((resolve) => setTimeout(resolve, 51));
      t.expect(sendFn).toHaveBeenCalledTimes(1);

      // Wait for first attempt + retry
      await new Promise((resolve) => setTimeout(resolve, 101));
      t.expect(sendFn).toHaveBeenCalledTimes(2); // First attempt fails, then succeeds

      // Wait for next scheduled send (should happen at original interval)
      sender.enqueue('event2');
      await new Promise((resolve) => setTimeout(resolve, 51));
      t.expect(sendFn).toHaveBeenCalledTimes(3);
      t.expect(sendFn).toHaveBeenCalledWith(['event2']);
    },
  );

  t.it('should not send when batch is empty', async () => {
    sender.start();
    await new Promise((resolve) => setTimeout(resolve, 51));
    t.expect(sendFn).not.toHaveBeenCalled(); // No send if batch is empty
  });

  t.it('should handle concurrent sends properly', async () => {
    let resolveSend!: (value?: unknown) => void;
    sendFn = t.vi.fn().mockImplementation(
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );
    sender = new Sender({ batchSize: 100, baseIntervalMs: 1000, sendFn });
    sender.start();

    sender.enqueue('event1');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    t.expect(sendFn).toHaveBeenCalledWith(['event1']);

    sender.enqueue('event2'); // Enqueue while sending
    resolveSend(); // Finish the first send
    await Promise.resolve(); // Allow async flush to complete

    // Wait for next scheduled send
    await new Promise((resolve) => setTimeout(resolve, 1000));
    t.expect(sendFn).toHaveBeenCalledWith(['event2']);
    t.expect(sendFn).toHaveBeenCalledTimes(2);
  });
});
