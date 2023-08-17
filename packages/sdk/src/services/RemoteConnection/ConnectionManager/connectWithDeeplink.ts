import {
  METAMASK_DEEPLINK_BASE,
  METAMASK_CONNECT_BASE_URL,
} from '../../../constants';
import { RemoteConnectionState } from '../RemoteConnection';

/**
 * Generates and opens a universal link or deeplink for MetaMask connection based on given parameters.
 *
 * @param state Current state of the RemoteConnection class instance.
 * @param linkParams A string representing the parameters used to form the universal and deep links.
 * @returns Promise<void>
 */
export async function connectWithDeeplink(
  state: RemoteConnectionState,
  linkParams: string,
): Promise<void> {
  const universalLink = `${METAMASK_CONNECT_BASE_URL}?${linkParams}`;
  const deeplink = `${METAMASK_DEEPLINK_BASE}?${linkParams}`;

  // console.log('OPEN LINK', universalLink);
  state.platformManager?.openDeeplink?.(universalLink, deeplink, '_self');
}
