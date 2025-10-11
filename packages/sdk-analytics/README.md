# MetaMask SDK Analytics

This package provides a client for tracking analytics events for dApps and other components using the MetaMask SDK. It is designed to be fully type-safe, leveraging a schema generated from a backend OpenAPI specification.

## Overview

The analytics client is a singleton that exposes two distinct sub-clients for different API versions:

-   `analytics.v1`: A legacy client for sending events to the V1 backend endpoint. Its interface is designed for backward compatibility.
-   `analytics.v2`: A modern, namespaced client for sending events to the V2 backend endpoint. This is the recommended client for all new implementations.

A single `analytics.enable()` call controls event tracking for both clients.

## Usage

### For New Implementations (V2)

The V2 client uses a "namespaced" approach. Each event belongs to a specific namespace, which must be configured before tracking.

1.  **Import the client:**
    ```typescript
    import { analytics } from '@metamask/sdk-analytics';
    ```

2.  **Enable tracking:**
    This should be done once when your application starts.
    ```typescript
    analytics.enable();
    ```

3.  **Set up your namespace:**
    Configure any common properties that should be included with every event for your namespace. For SDKs, this should include `package_name` and `package_version`.
    ```typescript
    import { name as packageName, version as packageVersion } from '../package.json';

    analytics.v2.setup('sdk/connect', {
      package_name: packageName,
      package_version: packageVersion,
      platform: 'web-desktop',
    });
    ```

4.  **Track an event:**
    The `track` method is fully type-safe. Your editor will provide autocomplete for the `namespace`, `eventName`, and the `properties` required for that event, all based on the master schema.
    ```typescript
    analytics.v2.track('sdk/connect', 'sdk_initialized', {
      dapp_id: 'aave.com',
      anon_id: 'some-anonymous-uuid',
      integration_type: 'direct',
    });
    ```

### For Migrating Legacy V1 Code

The `v1` client provides an interface that is backward compatible with previous versions of this package, making migration straightforward.

1.  **Enable tracking:**
    ```typescript
    import { analytics } from '@metamask/sdk-analytics';

    analytics.enable();
    ```

2.  **Set global properties:**
    Use `setGlobalProperty` to set common properties for all V1 events.
    ```typescript
    analytics.v1.setGlobalProperty('sdk_version', '0.9.0');
    analytics.v1.setGlobalProperty('platform', 'web-desktop');
    ```

3.  **Track an event:**
    The `track` method on the `v1` client uses the original flat event structure.
    ```typescript
    analytics.v1.track('sdk_initialized', {
      dapp_id: 'example.com',
      anon_id: 'some-anonymous-uuid',
      integration_type: 'direct',
    });
    ```
