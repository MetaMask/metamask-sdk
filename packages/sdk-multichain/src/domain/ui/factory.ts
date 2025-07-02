import { isBrowser, isReactNative } from '../platform';
import type { UIManager, PlatformUIOptions } from './index';

/**
 * Creates the appropriate UI manager based on the current platform
 */
export async function createUIManager(options: PlatformUIOptions): Promise<UIManager> {
  if (isBrowser()) {
    const { BrowserUIManager } = await import('./browser');
    return new BrowserUIManager(options);
  }

  if (isReactNative()) {
    const { ReactNativeUIManager } = await import('./native');
    return new ReactNativeUIManager(options);
  }

  // Node.js or other non-browser environments
  const { NodeUIManager } = await import('./node');
  return new NodeUIManager(options);
}
