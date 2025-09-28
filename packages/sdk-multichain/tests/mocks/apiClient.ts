/**
 * This file mocks API Client package in the SDK
 * We just wrap the getDefaultTransport to have the ability to mock it after in fixtures file
 */
import * as t from 'vitest';

t.vi.mock('@metamask/multichain-api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@metamask/multichain-api-client')>();
  return {
    ...actual,
    getDefaultTransport: t.vi.fn(() => {
      return actual.getDefaultTransport()
    })
  };
});
