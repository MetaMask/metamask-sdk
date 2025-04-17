export { SendAnalytics } from './Analytics';
export type { AnalyticsProps } from './Analytics';

export { initAnalyticsClient, trackEvent } from './v2';
export type { AnalyticsProps as V2AnalyticsProps, BaseAnalyticsProps as V2BaseAnalyticsProps } from './v2';

// Removed re-exports from communication-layer
// export type {
//   TrackingEvents,
//   OriginatorInfo,
//   CommunicationLayerPreference,
// } from '@metamask/sdk-communication-layer';
