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
      state.preferredOpenLink(
        state.useDeeplink ? deeplink : universalLink,
        target,
      );
      return;
    }

    if (state.debug) {
      console.warn(
        `Platform::openDeepLink() open link now useDeepLink=${state.useDeeplink}`,
        state.useDeeplink ? deeplink : universalLink,
      );
    }

    // It should only open after we can acknowledge that the rpc call that triggered the deeplink has been sent
    // TODO how can we know that the rpc call has been sent?
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
