import { logger } from '../../utils/logger';
import {
  PlatformManager,
} from '../../Platform/PlatfformManager';

export function openDeeplink(
  instance: PlatformManager,
  universalLink: string,
  deeplink: string,
  target?: string,
) {
  const { state } = instance;

  logger(
    `[PlatfformManager: openDeeplink()] universalLink --> ${universalLink}`,
  );
  logger(`[PlatfformManager: openDeeplink()] deepLink --> ${deeplink}`);

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

    logger(
      `[PlatfformManager: openDeeplink()] open link now useDeepLink=${
        state.useDeeplink
      } link=${state.useDeeplink ? deeplink : universalLink}`,
    );

    // It should only open after we can acknowledge that the rpc call that triggered the deeplink has been sent
    // TODO how can we know that the rpc call has been sent?
    if (state.useDeeplink) {
      if (typeof window !== 'undefined') {
        // We don't need to open a deeplink in a new tab
        // It avoid the browser to display a blank page
        window.location.href = deeplink;
      }
    } else {
      // Workaround for https://github.com/rainbow-me/rainbowkit/issues/524.
      // Using 'window.open' causes issues on iOS in non-Safari browsers and
      // WebViews where a blank tab is left behind after connecting.
      // This is especially bad in some WebView scenarios (e.g. following a
      // link from Twitter) where the user doesn't have any mechanism for
      // closing the blank tab.
      // For whatever reason, links with a target of "_blank" don't suffer
      // from this problem, and programmatically clicking a detached link
      // element with the same attributes also avoids the issue.
      const link = document.createElement("a");
      link.href = universalLink;
      link.target = "_self";
      link.rel = "noreferrer noopener";
      link.click();
    }
  } catch (err) {
    console.log(`[PlatfformManager: openDeeplink()] can't open link`, err);
  }

  // console.log('Please setup the openDeeplink parameter');
}
