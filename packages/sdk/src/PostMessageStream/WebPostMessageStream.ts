import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { PostMessageStream } from './PostMessageStream.interface';

export class WebPostMessageStream
  extends WindowPostMessageStream
  implements Partial<PostMessageStream>
{
  start(): void {
    // nothing to do here.
  }
}
