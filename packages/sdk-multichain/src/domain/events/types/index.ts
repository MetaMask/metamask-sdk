import type { ExtensionEvents } from './extension';
import type { SDKEvents } from './sdk';

export type EventTypes = SDKEvents | ExtensionEvents;
export type { SDKEvents, ExtensionEvents };
