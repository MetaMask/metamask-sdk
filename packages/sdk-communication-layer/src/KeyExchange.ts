import { EventEmitter2 } from 'eventemitter2';
import { ECIES, ECIESProps } from './ECIES';
import { CommunicationLayer } from './types/CommunicationLayer';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { EventType } from './types/EventType';
import { InternalEventType } from './types/InternalEventType';
import { KeyExchangeMessageType } from './types/KeyExchangeMessageType';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LogggingOptions';

export interface KeyExchangeProps {
  communicationLayer: CommunicationLayer;
  otherPublicKey?: string;
  sendPublicKey: boolean;
  context: string;
  logging?: CommunicationLayerLoggingOptions;
  ecies?: ECIESProps;
}

export class KeyExchange extends EventEmitter2 {
  private keysExchanged = false;

  private myECIES: ECIES;

  private otherPublicKey = '';

  private communicationLayer: CommunicationLayer;

  private myPublicKey: string;

  private sendPublicKey: boolean;

  private step = KeyExchangeMessageType.KEY_HANDSHAKE_NONE;

  private context: string;

  private debug = false;

  constructor({
    communicationLayer,
    otherPublicKey,
    sendPublicKey,
    context,
    ecies,
    logging,
  }: KeyExchangeProps) {
    super();

    this.context = context;
    this.myECIES = new ECIES(ecies);
    this.communicationLayer = communicationLayer;
    this.myPublicKey = this.myECIES.getPublicKey();
    this.debug = logging?.keyExchangeLayer === true;

    if (otherPublicKey) {
      this.setOtherPublicKey(otherPublicKey);
    }
    this.sendPublicKey = sendPublicKey;

    this.communicationLayer.on(
      InternalEventType.KEY_EXCHANGE,
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

    if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_SYN) {
      this.checkStep(KeyExchangeMessageType.KEY_HANDSHAKE_NONE);
      this.step = KeyExchangeMessageType.KEY_HANDSHAKE_ACK;
      this.emit(EventType.KEY_INFO, this.step);

      if (this.debug) {
        console.debug(`KeyExchange::KEY_HANDSHAKE_SYN`);
      }

      if (this.sendPublicKey && message.pubkey && !this.otherPublicKey) {
        this.setOtherPublicKey(message.pubkey);
      }

      this.communicationLayer.sendMessage({
        type: KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK,
        pubkey: this.myPublicKey,
      });
    } else if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK) {
      this.checkStep(KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK);

      if (this.debug) {
        console.debug(`KeyExchange::KEY_HANDSHAKE_SYNACK`);
      }

      this.setOtherPublicKey(message.pubkey ?? '');

      this.communicationLayer.sendMessage({
        type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
      });
      this.keysExchanged = true;
      this.emit(EventType.KEYS_EXCHANGED);
    } else if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_ACK) {
      if (this.debug) {
        console.debug(
          `KeyExchange::KEY_HANDSHAKE_ACK set keysExchanged to true!`,
        );
      }
      this.checkStep(KeyExchangeMessageType.KEY_HANDSHAKE_ACK);
      this.keysExchanged = true;
      this.emit(EventType.KEYS_EXCHANGED);
    }
  }

  setSendPublicKey(sendPublicKey: boolean) {
    this.sendPublicKey = sendPublicKey;
  }

  resetKeys(ecies?: ECIESProps) {
    this.clean();
    this.myECIES = new ECIES(ecies);
  }

  clean(): void {
    if (this.debug) {
      console.debug(
        `KeyExchange::${this.context}::clean reset handshake state`,
      );
    }
    this.step = KeyExchangeMessageType.KEY_HANDSHAKE_NONE;
    this.emit(EventType.KEY_INFO, this.step);
    this.keysExchanged = false;
    this.otherPublicKey = '';
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
    this.checkStep(KeyExchangeMessageType.KEY_HANDSHAKE_NONE);
    this.step = KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK;
    this.emit(EventType.KEY_INFO, this.step);
    this.communicationLayer.sendMessage({
      type: KeyExchangeMessageType.KEY_HANDSHAKE_SYN,
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
      ecies: { ...this.myECIES.getKeyInfo(), otherPubKey: this.otherPublicKey },
      step: this.step,
      keysExchanged: this.areKeysExchanged(),
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
