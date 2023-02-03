import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { PostMessageStream } from './PostMessageStream';

export class WebPostMessageStream
  extends WindowPostMessageStream
  implements Partial<PostMessageStream>
{
  start(): void {
    // nothing to do here.
  }
}
