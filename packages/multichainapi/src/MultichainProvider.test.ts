import { describe, expect, it } from '@jest/globals';
import { MultichainProvider } from './providers/MultichainProvider';

describe('MultichainProvider', () => {
  it('should create a session', async () => {
    const provider = new MultichainProvider();
    const session = await provider.createSession('eip155:1', '0x123');

    expect(session).toMatchObject({
      chainId: 'eip155:1',
      account: '0x123',
    });
    expect(session.id).toBeDefined();
    expect(session.expiry).toBeGreaterThan(Date.now());
  });

  it('should revoke a session', async () => {
    const provider = new MultichainProvider();
    const session = await provider.createSession('eip155:1', '0x123');

    const result = await provider.revokeSession(session.id);
    expect(result).toBe(true);

    const retrievedSession = await provider.getSession(session.id);
    expect(retrievedSession).toBeUndefined();
  });
});
