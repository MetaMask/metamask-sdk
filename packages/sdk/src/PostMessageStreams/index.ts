import { WindowPostMessageStream } from '@metamask/post-message-stream';
import Platform, { PlatformName } from '../Platform';
import RemoteCommunicationPostMessageStream from './RemoteCommunicationPostMessageStream';
import WalletConnectPostMessageStream from './WalletConnectPostMessageStream'

const PostMessageStreams = {
  useWalletConnect: false,
  getPostMessageStreamToUse(){
    const platform = Platform.getPlatform();
  
    if (platform === PlatformName.MetaMaskMobileWebview)
      return WindowPostMessageStream;
  
    return this.useWalletConnect ? WalletConnectPostMessageStream : RemoteCommunicationPostMessageStream
  }
}

export default PostMessageStreams
