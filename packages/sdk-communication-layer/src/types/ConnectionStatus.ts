export enum ConnectionStatus {
  // DISCONNECTED: counterparty is disconnected
  DISCONNECTED='disconnected',
  // WAITING: means connected to the websocket but the counterparty (MetaMask or Dapps) isn't.
  WAITING='waiting',
  // LINKED: is connected after handshake, using a different verb to avoid confusion to just being connected to the websocket and waiting for counterpart.
  LINKED='linked',
  // PAUSED:
  PAUSED='paused',
}
