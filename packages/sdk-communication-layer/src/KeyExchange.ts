import { EventEmitter2 } from 'eventemitter2';
import { ECIES, ECIESProps } from './ECIES';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { KeyInfo } from './types/KeyInfo';
import { MessageType } from './types/MessageType';

export interface KeyExchangeProps {
  communicationLayer: CommunicationLayer;
  otherPublicKey?: string;
  sendPublicKey: boolean;
  context: string;
  debug: boolean;
  ecies?: ECIESProps;
}

export class KeyExchange extends EventEmitter2 {
  private keysExchanged = false;

  private myECIES: ECIES;

  private otherPublicKey = '';

  private communicationLayer: CommunicationLayer;

  private myPublicKey: string;

  private sendPublicKey: boolean;

  private step = MessageType.KEY_HANDSHAKE_NONE;

  private context: string;

  private debug = false;

  constructor({
    communicationLayer,
    otherPublicKey,
    sendPublicKey,
    context,
    ecies,
    debug = false,
  }: KeyExchangeProps) {
    super();

    this.context = context;
    this.myECIES = new ECIES(ecies);
    this.communicationLayer = communicationLayer;
    this.myPublicKey = this.myECIES.getPublicKey();
    this.debug = debug;

    if (otherPublicKey) {
      this.setOtherPublicKey(otherPublicKey);
    }
    this.sendPublicKey = sendPublicKey;

    this.communicationLayer.on(
      MessageType.KEY_EXCHANGE,
      this.onKeyExchangeMessage.bind(this),
    );
  }

  private onKeyExchangeMessage(keyExchangeMsg: {
    message: CommunicationLayerMessage;
  }) {
    if (this.debug) {
      console.debug(
        `KeyExchange::${this.context}::onKeyExchangeMessage() keysExchanged=${this.keysExchanged}`,
        keyExchangeMsg,
      );
    }

    const { message } = keyExchangeMsg;
    if (this.keysExchanged) {
      if (this.debug) {
        console.log(
          `KeyExchange::${this.context}::onKeyExchangeMessage STOP handshake already exchanged`,
        );
      }
      return;
    }

    if (message.type === MessageType.KEY_HANDSHAKE_SYN) {
      this.checkStep(MessageType.KEY_HANDSHAKE_NONE);
      this.step = MessageType.KEY_HANDSHAKE_ACK;

      if (this.debug) {
        console.debug(`KeyExchange::KEY_HANDSHAKE_SYN`);
      }

      if (this.sendPublicKey && message.pubkey && !this.otherPublicKey) {
        this.setOtherPublicKey(message.pubkey);
      }

      this.communicationLayer.sendMessage({
        type: MessageType.KEY_HANDSHAKE_SYNACK,
        pubkey: this.myPublicKey,
      });
    } else if (message.type === MessageType.KEY_HANDSHAKE_SYNACK) {
      this.checkStep(MessageType.KEY_HANDSHAKE_SYNACK);

      if (this.debug) {
        console.debug(`KeyExchange::KEY_HANDSHAKE_SYNACK`);
      }

      this.setOtherPublicKey(message.pubkey ?? '');

      this.communicationLayer.sendMessage({
        type: MessageType.KEY_HANDSHAKE_ACK,
      });
      this.keysExchanged = true;
      this.emit(MessageType.KEYS_EXCHANGED);
    } else if (message.type === MessageType.KEY_HANDSHAKE_ACK) {
      if (this.debug) {
        console.debug(
          `KeyExchange::KEY_HANDSHAKE_ACK set keysExchanged to true!`,
        );
      }
      this.checkStep(MessageType.KEY_HANDSHAKE_ACK);
      this.keysExchanged = true;
      this.emit(MessageType.KEYS_EXCHANGED);
    }
  }

  setSendPublicKey(sendPublicKey: boolean) {
    this.sendPublicKey = sendPublicKey;
  }

  clean(
    { keepOtherPublicKey }: { keepOtherPublicKey?: boolean } = {
      keepOtherPublicKey: false,
    },
  ): void {
    if (this.debug) {
      console.debug(
        `KeyExchange::${this.context}::clean reset handshake state`,
      );
    }
    this.step = MessageType.KEY_HANDSHAKE_NONE;
    this.keysExchanged = false;
    if (!keepOtherPublicKey) {
      this.otherPublicKey = '';
    }
  }

  start(isOriginator: boolean): void {
    if (this.debug) {
      console.debug(
        `KeyExchange::${this.context}::start isOriginator=${isOriginator}`,
      );
    }

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
      console.log(`Invalid step ${this.step} vs ${step}`);
      throw new Error(`Wrong Step ${this.step} ${step}`);
    }
  }

  areKeysExchanged() {
    return this.keysExchanged;
  }

  getMyPublicKey() {
    return this.myPublicKey;
  }

  setOtherPublicKey(otherPubKey: string) {
    if (this.debug) {
      console.debug(`KeyExchange::setOtherPubKey()`, otherPubKey);
    }
    this.otherPublicKey = otherPubKey;
  }

  encryptMessage(message: string): string {
    if (!this.otherPublicKey) {
      throw new Error(
        'encryptMessage: Keys not exchanged - missing otherPubKey',
      );
    }
    return this.myECIES.encrypt(message, this.otherPublicKey);
  }

  decryptMessage(message: string): string {
    if (!this.otherPublicKey) {
      throw new Error(
        'decryptMessage: Keys not exchanged - missing otherPubKey',
      );
    }
    return this.myECIES.decrypt(message);
  }

  getKeyInfo(): KeyInfo {
    return {
      ...this.myECIES.getKeyInfo(),
      otherPubKey: this.otherPublicKey,
    };
  }

  toString() {
    const buf = {
      keyInfo: this.getKeyInfo(),
      keysExchanged: this.keysExchanged,
      step: this.step,
    };
    console.debug(`KeyExchange::toString()`, buf);
  }
}
