/**
 * Checks if the current domain is blocked
 *
 * returns {boolean} {@code true} if the current domain is blocked
 */
export function blockedDomainCheck() {
  const blockedDomains = [
    'uscourts.gov',
    'dropbox.com',
    'webbyawards.com',
    'cdn.shopify.com/s/javascripts/tricorder/xtld-read-only-frame.html',
    'adyen.com',
    'gravityforms.com',
    'harbourair.com',
    'ani.gamer.com.tw',
    'blueskybooking.com',
    'sharefile.com',
  ];
  const currentUrl = window.location.href;
  let currentRegex;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < blockedDomains.length; i++) {
    const blockedDomain = blockedDomains[i].replace('.', '\\.');
    currentRegex = new RegExp(
      `(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`,
      'u',
    );

    if (!currentRegex.test(currentUrl)) {
      return true;
    }
  }
  return false;
}
