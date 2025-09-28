import * as t from 'vitest';

t.vi.mock('../../src/domain/logger', () => {
  const __mockLogger =t.vi.fn();
  return {
    createLogger:t.vi.fn(() => __mockLogger),
    enableDebug:t.vi.fn(() => {}),
    isEnabled:t.vi.fn(() => true),
    __mockLogger,
  };
});


