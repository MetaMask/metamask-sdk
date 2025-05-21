# MetaMask SDK Analytics

## Overview

The `@metamask/sdk-analytics` package tracks analytics events for dApps using the MetaMask SDK. It provides a TypeScript-based client for sending events to an analytics API with batching and schema validation.

## Purpose

Enables dApps to:

- Track SDK events (e.g., sdk_initialized, connection_initiated).
- Send events to an analytics API.
- Ensure type safety with OpenAPI schemas.

## Features

- Event Tracking: Supports events like sdk_initialized, sdk_used_chain, and wallet actions.
- Batching: Events are batched for efficient network usage.
- Error Handling: Uses exponential backoff for failed requests.
- Type Safety: Leverages TypeScript and OpenAPI schemas.

## Usage

Import the global client, enable it, set global props and track events.

```typescript
import { analytics } from '@metamask/sdk-analytics';

analytics.enable();

analytics.setGlobalProperty('sdk_version', '1.0.0');
analytics.setGlobalProperty('platform', 'web-desktop');

analytics.track('sdk_initialized', {
  dapp_id: 'example.com',
  anon_id: 'bbbc1727-8b85-433a-a26a-e9df70ddc81c',
  integration_type: 'direct',
});
```
