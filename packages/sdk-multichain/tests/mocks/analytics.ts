
import * as t from 'vitest';

t.vi.mock('@metamask/sdk-analytics', () => ({
  analytics: {
    setGlobalProperty:t.vi.fn(),
    enable:t.vi.fn(),
    track:t.vi.fn(),
  },
}));

