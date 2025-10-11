import nock from 'nock';
/* eslint-disable-next-line id-length */
import * as t from 'vitest';

import Analytics from './analytics';
import type * as schema from './schema';

type EventV1 = schema.components['schemas']['Event'];
type EventV2 = schema.components['schemas']['EventV2'];

const BASE_URL = 'http://localhost:8000';

t.describe('Analytics Client', () => {
  let analytics: Analytics;

  t.beforeEach(() => {
    analytics = new Analytics(BASE_URL);
    nock.cleanAll();
  });

  t.afterAll(() => {
    nock.cleanAll();
  });

  t.it('should do nothing if enable() is not called', async () => {
    // Set up nock to fail the test if any request is made
    const scope = nock(BASE_URL)
      .post('/v1/events')
      .reply(200)
      .post('/v2/events')
      .reply(200);

    analytics.v1.track('sdk_initialized', {});
    analytics.v2.setup('sdk/connect', {});
    analytics.v2.track('sdk/connect', 'sdk_initialized', {
      package_name: 'test',
      package_version: '1.0.0',
      dapp_id: 'test',
      anon_id: 'test',
      platform: 'web-desktop',
      integration_type: 'test',
    });

    // Wait a bit to ensure no flush happens
    await new Promise((resolve) => setTimeout(resolve, 300));

    t.expect(scope.isDone()).toBe(false); // No requests should have been made
  });

  t.describe('analytics.v1', () => {
    t.it(
      'should send a correctly formatted V1 event to the /v1/events endpoint',
      async () => {
        let capturedBody: EventV1[] | undefined;
        const scope = nock(BASE_URL)
          .post('/v1/events', (body) => {
            capturedBody = body;
            return true;
          })
          .reply(200, { status: 'success' });

        analytics.enable();
        analytics.v1.setGlobalProperty('platform', 'web-desktop');
        analytics.v1.track('sdk_initialized', {
          sdk_version: '0.0.1',
          dapp_id: 'test.com',
          anon_id: 'anon-123',
          integration_type: 'test',
        });

        // Wait for the sender to flush
        await new Promise((resolve) => setTimeout(resolve, 300));

        t.expect(scope.isDone()).toBe(true);
        t.expect(capturedBody).toBeDefined();
        t.expect(capturedBody).toHaveLength(1);
        t.expect(capturedBody?.[0]).toEqual({
          name: 'sdk_initialized',
          platform: 'web-desktop', // Global property
          sdk_version: '0.0.1',
          dapp_id: 'test.com',
          anon_id: 'anon-123',
          integration_type: 'test',
        });
      },
    );
  });

  t.describe('analytics.v2', () => {
    const sdkConnectProps = {
      package_name: '@metamask/sdk-multichain',
      package_version: '1.0.0',
      dapp_id: 'aave.com',
      anon_id: 'anon-456',
      platform: 'web-desktop',
      integration_type: 'direct',
    } as const;

    t.it(
      'should send a correctly formatted V2 event to the /v2/events endpoint',
      async () => {
        let capturedBody: EventV2[] | undefined;
        const scope = nock(BASE_URL)
          .post('/v2/events', (body) => {
            capturedBody = body;
            return true;
          })
          .reply(200, { status: 'success' });

        analytics.enable();
        analytics.v2.setup('sdk/connect', {
          package_name: sdkConnectProps.package_name,
          package_version: sdkConnectProps.package_version,
          platform: sdkConnectProps.platform,
        });

        analytics.v2.track('sdk/connect', 'sdk_initialized', {
          dapp_id: sdkConnectProps.dapp_id,
          anon_id: sdkConnectProps.anon_id,
          integration_type: sdkConnectProps.integration_type,
        });

        // Wait for the sender to flush
        await new Promise((resolve) => setTimeout(resolve, 300));

        t.expect(scope.isDone()).toBe(true);
        t.expect(capturedBody).toBeDefined();
        t.expect(capturedBody).toHaveLength(1);
        t.expect(capturedBody?.[0]).toEqual({
          namespace: 'sdk/connect',
          event_name: 'sdk_initialized',
          properties: {
            // Merged from setup() and track()
            package_name: sdkConnectProps.package_name,
            package_version: sdkConnectProps.package_version,
            dapp_id: sdkConnectProps.dapp_id,
            anon_id: sdkConnectProps.anon_id,
            platform: sdkConnectProps.platform,
            integration_type: sdkConnectProps.integration_type,
          },
        });
      },
    );

    t.it(
      'should throw an error if track() is called for a namespace without setup',
      () => {
        analytics.enable();
        // This should throw because 'mobile/sdk-connect-v2' was never set up
        t.expect(() =>
          analytics.v2.track(
            'mobile/sdk-connect-v2',
            'wallet_action_received',
            {
              anon_id: 'test',
              platform: 'mobile',
            },
          ),
        ).toThrow(
          'No configuration found for namespace: "mobile/sdk-connect-v2"',
        );
      },
    );
  });
});
