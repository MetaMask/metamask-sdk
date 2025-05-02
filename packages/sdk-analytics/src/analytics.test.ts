import nock from 'nock';
/* eslint-disable-next-line id-length */
import * as t from 'vitest';

import Analytics from './analytics';
import type * as schema from './schema';

t.describe('Analytics Integration', () => {
  let analytics: Analytics;
  let scope: nock.Scope;

  const event: schema.components['schemas']['SdkInitializedEvent'] = {
    name: 'sdk_initialized',
    sdk_version: '1.0.0',
    dapp_id: 'aave.com',
    anon_id: 'bbbc1727-8b85-433a-a26a-e9df70ddc81c',
    platform: 'web-desktop',
    integration_type: 'direct',
  };

  t.afterAll(() => {
    /* eslint-disable-next-line import-x/no-named-as-default-member */
    nock.cleanAll();
  });

  t.it('should do nothing when disabled', async () => {
    let captured: Event[] = [];
    scope = nock('http://127.0.0.1')
      .post('/v1/events', (body) => {
        captured = body; // Capture the request body directly
        return true; // Accept any body to proceed with the intercept
      })
      .optionally()
      .reply(
        200,
        { status: 'success' },
        { 'Content-Type': 'application/json' },
      );

    analytics = new Analytics('http://127.0.0.1');
    analytics.track(event.name, { ...event });

    // Wait for the Sender to flush the event (baseIntervalMs = 200ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify the captured payload
    t.expect(captured).toEqual([]);

    scope.done();
  });

  t.it('should track an event when enabled', async () => {
    let captured: Event[] = [];
    scope = nock('http://127.0.0.2')
      .post('/v1/events', (body) => {
        captured = body; // Capture the request body directly
        return true; // Accept any body to proceed with the intercept
      })
      .reply(
        200,
        { status: 'success' },
        { 'Content-Type': 'application/json' },
      );

    analytics = new Analytics('http://127.0.0.2');
    analytics.enable();
    analytics.setGlobalProperty('sdk_version', event.sdk_version);
    analytics.setGlobalProperty('anon_id', event.anon_id);
    analytics.setGlobalProperty('platform', event.platform);
    analytics.setGlobalProperty('integration_type', event.integration_type);
    analytics.track(event.name, { dapp_id: 'some-non-global-property' });

    // Wait for the Sender to flush the event (baseIntervalMs = 200ms + buffer)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify the captured payload
    t.expect(captured).toEqual([
      { ...event, dapp_id: 'some-non-global-property' },
    ]);

    scope.done();
  });
});
