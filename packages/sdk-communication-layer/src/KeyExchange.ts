import { EventEmitter2 } from 'eventemitter2';
import { ECIES } from './ECIES';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { MessageType } from './types/MessageType';

export interface KeyExchangeProps {
  communicationLayer: CommunicationLayer;
  otherPublicKey?: string;
  sendPublicKey: boolean;
  context: string;
}

export class KeyExchange extends EventEmitter2 {
  keysExchanged = false;

  myECIES: ECIES;

  otherPublicKey = '';

  communicationLayer: CommunicationLayer;

  myPublicKey: string;

  sendPublicKey: boolean;

  step = MessageType.KEY_HANDSHAKE_NONE;

  context: string;

  constructor({
    communicationLayer,
    otherPublicKey,
    sendPublicKey,
    context,
  }: KeyExchangeProps) {
    super();

    this.context = context;
    this.myECIES = new ECIES();
    this.myECIES.generateECIES();
    this.communicationLayer = communicationLayer;
    this.myPublicKey = this.myECIES.getPublicKey();

    if (otherPublicKey) {
      this.onOtherPublicKey(otherPublicKey);
    }
    this.sendPublicKey = sendPublicKey;

    this.communicationLayer.on(
      MessageType.KEY_EXCHANGE,
      this.onKeyExchangeMessage.bind(this),
    );
  }

  private onKeyExchangeMessage({
    message,
  }: {
    message: CommunicationLayerMessage;
  }) {
    console.debug(
      `[keyExchange][${this.context}] key exchange message received`,
      message,
    );

    if (this.keysExchanged) {
      return;
    }

    if (message.type === MessageType.KEY_HANDSHAKE_SYN) {
      this.checkStep(MessageType.KEY_HANDSHAKE_NONE);
      this.step = MessageType.KEY_HANDSHAKE_ACK;

      if (this.sendPublicKey && message.pubkey && !this.otherPublicKey) {
        this.onOtherPublicKey(message.pubkey);
      }

      this.communicationLayer.sendMessage({
        type: MessageType.KEY_HANDSHAKE_SYNACK,
        pubkey: this.myPublicKey,
      });
    } else if (message.type === MessageType.KEY_HANDSHAKE_SYNACK) {
      this.checkStep(MessageType.KEY_HANDSHAKE_SYNACK);

      this.onOtherPublicKey(message.pubkey ?? '');

      this.communicationLayer.sendMessage({
        type: MessageType.KEY_HANDSHAKE_ACK,
      });
      this.keysExchanged = true;
      this.emit(MessageType.KEYS_EXCHANGED);
    } else if (message.type === MessageType.KEY_HANDSHAKE_ACK) {
      this.checkStep(MessageType.KEY_HANDSHAKE_ACK);
      this.keysExchanged = true;
      this.emit(MessageType.KEYS_EXCHANGED);
    }
  }

  clean(): void {
    this.step = MessageType.KEY_HANDSHAKE_NONE;
    this.keysExchanged = false;
    this.otherPublicKey = '';
  }

  start(isOriginator: boolean): void {
    if (isOriginator) {
      this.clean();
    }
    this.checkStep(MessageType.KEY_HANDSHAKE_NONE);
    this.step = MessageType.KEY_HANDSHAKE_SYNACK;
    this.communicationLayer.sendMessage({
      type: MessageType.KEY_HANDSHAKE_SYN,
      pubkey: this.sendPublicKey ? this.myPublicKey : undefined,
    });
  }

  checkStep(step: string): void {
    if (this.step.toString() !== step) {
      throw new Error(`Wrong Step ${this.step} ${step}`);
    }
  }

  private onOtherPublicKey(pubkey: string): void {
    this.otherPublicKey = pubkey;
  }

  encryptMessage(message: string): string {
    if (!this.otherPublicKey) {
      throw new Error('Keys not exchanged');
    }
    return this.myECIES.encrypt(message, this.otherPublicKey);
  }

  decryptMessage(message: string): string {
    if (!this.otherPublicKey) {
      throw new Error('Keys not exchanged');
    }
    return this.myECIES.decrypt(message);
  }
}
