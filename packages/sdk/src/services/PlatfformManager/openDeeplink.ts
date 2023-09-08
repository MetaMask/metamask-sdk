import {
  LINK_OPEN_DELAY,
  PlatformManager,
} from '../../Platform/PlatfformManager';

export function openDeeplink(
  instance: PlatformManager,
  universalLink: string,
  deeplink: string,
  target?: string,
) {
  const { state } = instance;

  if (state.debug) {
    console.debug(`Platform::openDeepLink universalLink --> ${universalLink}`);
    console.debug(`Platform::openDeepLink deepLink --> ${deeplink}`);
  }

  if (instance.isBrowser()) {
    instance.enableWakeLock();
  }

  try {
    if (state.preferredOpenLink) {
      state.preferredOpenLink(universalLink, target);
      return;
    }

    if (typeof window !== 'undefined') {
      let win: Window | null;
      if (state.useDeeplink) {
        win = window.open(deeplink, '_blank');
      } else {
        win = window.open(universalLink, '_blank');
      }
      setTimeout(() => win?.close?.(), LINK_OPEN_DELAY);
    }
  } catch (err) {
    console.log(`Platform::openDeepLink() can't open link`, err);
  }

  // console.log('Please setup the openDeeplink parameter');
}
