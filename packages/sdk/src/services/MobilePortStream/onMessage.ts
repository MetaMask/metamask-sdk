import { Buffer } from 'buffer';
import { MobilePortStream } from '../../PortStream/MobilePortStream';

export function onMessage(instance: MobilePortStream, event: any) {
  const msg = event.data;

  // validate message
  if (instance._origin !== '*' && event.origin !== instance._origin) {
    return;
  }

  if (!msg || typeof msg !== 'object') {
    return;
  }

  if (!msg.data || typeof msg.data !== 'object') {
    return;
  }

  if (msg.target && msg.target !== instance._name) {
    return;
  }

  // Filter outgoing messages
  if (msg.data.data?.toNative) {
    return;
  }

  if (Buffer.isBuffer(msg)) {
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete msg._isBuffer;
    const data = Buffer.from(msg);
    instance.push(data);
  } else {
    instance.push(msg);
  }
}
