import { RemoteConnectionState } from '../RemoteConnection';

export async function connectWithDeeplink(
  state: RemoteConnectionState,
  linkParams: string,
): Promise<void> {
  const universalLink = `${'https://metamask.app.link/connect?'}${linkParams}`;
  const deeplink = `metamask://connect?${linkParams}`;

  // console.log('OPEN LINK', universalLink);
  state.platformManager?.openDeeplink?.(universalLink, deeplink, '_self');
}
