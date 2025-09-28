
import * as t from 'vitest';
import {vi} from 'vitest';

t.vi.mock('@metamask/multichain-api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@metamask/multichain-api-client')>();
  return {
    ...actual,
    getDefaultTransport: t.vi.fn(() => {
      return actual.getDefaultTransport()
    })
  };
});
