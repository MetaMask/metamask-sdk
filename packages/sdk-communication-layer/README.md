# MetaMask SDK Communication Layer

## Installation

`yarn add @metamask/sdk-communication-layer`

## Using

### Dapp

```ts
import {
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';

const remote = new RemoteCommunication({
  communicationLayerPreference: CommunicationLayerPreference.SOCKET,
});

const { channelId, pubKey } = remote.generateChannelId();

const linkParams = `channelId=${encodeURIComponent(
  channelId,
)}&comm=${encodeURIComponent('socket')}&pubkey=${encodeURIComponent(pubKey)}`;

console.log('Connect to', linkParams);

remote.on(MessageType.MESSAGE, (message) => {
  console.log('New Message', message);
});

remote.on(MessageType.CLIENTS_READY, (message) => {
  console.log('Clients now connected!');
});
```

### MetaMask

```ts
import {
  CommunicationLayerPreference,
  MessageType,
  RemoteCommunication,
} from '@metamask/sdk-communication-layer';

const url = new URL(this.state.urlToConnect);

// https://metamask.app.link/connect?channelId=4cddce59-c4ea-4c70-9dbf-d1ddbe8f7a9f&comm=socket&pubkey=BCCKuS6Z26iZkxA1oB69X9DN73dlCYEQa46d0id8MCXdshRHGqI4rVuIeXjMS2vrlq7PkD4nbzb7gEFn%2FJfHz4E%3D
console.log(url.searchParams);

const otherPublicKey = url.searchParams.get('pubkey');
const channelId = url.searchParams.get('channelId');
console.log('otherPublicKey', otherPublicKey);
console.log('channelId', channelId);

const remote = new RemoteCommunicationLib({
  commLayer: 'socket',
  otherPublicKey,
});

remote.connectToChannel({ channelId });

remote.on(MessageType.CLIENTS_READY, () => {
  this.setState({ connected: true });
});

remote.on(MessageType.MESSAGE, (message) => {
  console.log('New message', message);
});
```

## Contacts

Contact the MetaMask SDK team for a complimentary design optimization workshop [here](https://fq1an8d8ib2.typeform.com/to/sC7eK5F1)
