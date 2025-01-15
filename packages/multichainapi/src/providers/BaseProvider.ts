// packages/multichainapi/src/providers/BaseProvider.ts
import type { MethodParams } from '../types';

export interface Provider {
  connect(params: unknown): Promise<boolean>;
  disconnect(): void;
  request(params: MethodParams): Promise<unknown>;
  onNotification(callback: (notification: unknown) => void): void;
  removeNotificationListener(callback: (notification: unknown) => void): void;
  removeAllNotificationListeners(): void;
}
