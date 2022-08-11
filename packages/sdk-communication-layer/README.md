# MetaMask SDK Communication Layer

## Installation

`yarn add @metamask/sdk-communication-layer`

## Using

### Dapp

```
RemoteCommunication = new RemoteCommunicationLib({
      commLayer: 'socket'
    });

    const { channelId, pubKey } = RemoteCommunication.generateChannelId();

    const linkParams = `channelId=${encodeURIComponent(
      channelId,
    )}&comm=${encodeURIComponent(
      'socket'
    )}&pubkey=${encodeURIComponent(pubKey)}`;

    console.log("Connect to", linkParams)

    RemoteCommunication.on('message', (message) => {
      console.log("New Message", message)
    })

    RemoteCommunication.on('clients_ready', (message) => {
      console.log("Clients now connected!")
    })
```

### MetaMask

```
const url = new URL(this.state.urlToConnect);

    // https://metamask.app.link/connect?channelId=4cddce59-c4ea-4c70-9dbf-d1ddbe8f7a9f&comm=socket&pubkey=BCCKuS6Z26iZkxA1oB69X9DN73dlCYEQa46d0id8MCXdshRHGqI4rVuIeXjMS2vrlq7PkD4nbzb7gEFn%2FJfHz4E%3D
    console.log(url.searchParams);

    const otherPublicKey = url.searchParams.get('pubkey');
    const channelId = url.searchParams.get('channelId');
    console.log('otherPublicKey', otherPublicKey);
    console.log('channelId', channelId);

    RemoteCommunication = new RemoteCommunicationLib({
      commLayer: 'socket',
      otherPublicKey,
    });

    RemoteCommunication.connectToChannel(channelId);

    RemoteCommunication.on('clients_ready', () => {
      this.setState({ connected: true });
    });

    RemoteCommunication.on('message', (message) => {
      console.log("New message", message);
    });
```
