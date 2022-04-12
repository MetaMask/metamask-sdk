import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { CommunicationLayerPreference } from '../constants';
import Platform, { PlatformName } from '../Platform';
import RemoteCommunicationPostMessageStream from './RemoteCommunicationPostMessageStream';
import WalletConnectPostMessageStream from './WalletConnectPostMessageStream'

const PostMessageStreams = {
  communicationLayerPreference: null,
  getPostMessageStreamToUse(){
    const platform = Platform.getPlatform();
  
    if (platform === PlatformName.MetaMaskMobileWebview)
      return WindowPostMessageStream;
  
    return this.communicationLayerPreference === CommunicationLayerPreference.WALLETCONNECT ? WalletConnectPostMessageStream : RemoteCommunicationPostMessageStream
  }
}

export default PostMessageStreams
