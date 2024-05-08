import { EventEmitter2 } from 'eventemitter2';
import { ECIES, ECIESProps } from './ECIES';
import { SocketService } from './SocketService';
import { CommunicationLayerMessage } from './types/CommunicationLayerMessage';
import { EventType } from './types/EventType';
import { InternalEventType } from './types/InternalEventType';
import { KeyExchangeMessageType } from './types/KeyExchangeMessageType';
import { KeyInfo } from './types/KeyInfo';
import { CommunicationLayerLoggingOptions } from './types/LoggingOptions';
import { logger } from './utils/logger';
import { PROTOCOL_VERSION } from './config';

export interface KeyExchangeProps {
  communicationLayer: SocketService;
  otherPublicKey?: string;
  sendPublicKey: boolean;
  context: string;
  logging?: CommunicationLayerLoggingOptions;
  ecies?: ECIESProps;
}

export class KeyExchange extends EventEmitter2 {
  private keysExchanged = false;

  private myECIES: ECIES;

  private otherPublicKey?: string;

  private communicationLayer: SocketService;

  private myPublicKey: string;

  private step: KeyExchangeMessageType =
    KeyExchangeMessageType.KEY_HANDSHAKE_NONE;

  private context: string;

  private debug = false;

  constructor({
    communicationLayer,
    otherPublicKey,
    context,
    ecies,
    logging,
  }: KeyExchangeProps) {
    super();

    this.context = context;

    this.communicationLayer = communicationLayer;

    if (ecies?.privateKey && otherPublicKey) {
      logger.KeyExchange(
        `[KeyExchange: constructor()] otherPubKey=${otherPublicKey} set keysExchanged to true!`,
        ecies,
      );

      this.keysExchanged = true;
    }

    this.myECIES = new ECIES({ ...ecies, debug: logging?.eciesLayer });
    this.myPublicKey = this.myECIES.getPublicKey();

    this.debug = logging?.keyExchangeLayer === true;

    if (otherPublicKey) {
      this.setOtherPublicKey(otherPublicKey);
    }

    this.communicationLayer.on(
      InternalEventType.KEY_EXCHANGE,
      this.onKeyExchangeMessage.bind(this),
    );
  }

  public onKeyExchangeMessage(keyExchangeMsg: {
    message: CommunicationLayerMessage;
  }) {
    const { relayPersistence } = this.communicationLayer.remote.state;

    logger.KeyExchange(
      `[KeyExchange: onKeyExchangeMessage()] context=${this.context} keysExchanged=${this.keysExchanged} relayPersistence=${relayPersistence}`,
      keyExchangeMsg,
    );

    if (relayPersistence) {
      logger.KeyExchange(
        `[KeyExchange: onKeyExchangeMessage()] Ignoring key exchange message because relay persistence is activated`,
      );
      return;
    }

    const { message } = keyExchangeMsg;
    if (this.keysExchanged) {
      logger.KeyExchange(
        `[KeyExchange: onKeyExchangeMessage()] context=${this.context} received handshake while already exchanged. step=${this.step} otherPubKey=${this.otherPublicKey}`,
      );
      // FIXME check if correct way / when is it really happening?
      // return;
    }

    this.emit(EventType.KEY_INFO, message.type);

    if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_SYN) {
      this.checkStep([
        KeyExchangeMessageType.KEY_HANDSHAKE_NONE,
        KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
      ]);

      logger.KeyExchange(
        `[KeyExchange: onKeyExchangeMessage()] KEY_HANDSHAKE_SYN`,
        message,
      );

      if (message.pubkey) {
        this.setOtherPublicKey(message.pubkey);
      }

      this.communicationLayer.sendMessage({
        type: KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK,
        pubkey: this.myPublicKey,
      });

      this.setStep(KeyExchangeMessageType.KEY_HANDSHAKE_ACK);
    } else if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK) {
      // TODO currently key exchange start from both side so step may be on both SYNACK or NONE or ACK.
      this.checkStep([
        KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK,
        KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
        KeyExchangeMessageType.KEY_HANDSHAKE_NONE,
      ]);

      logger.KeyExchange(
        `[KeyExchange: onKeyExchangeMessage()] KEY_HANDSHAKE_SYNACK`,
      );

      if (message.pubkey) {
        this.setOtherPublicKey(message.pubkey);
      }

      this.communicationLayer.sendMessage({
        type: KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
      });
      this.keysExchanged = true;
      // Reset step value for next exchange.
      this.setStep(KeyExchangeMessageType.KEY_HANDSHAKE_ACK);
      this.emit(EventType.KEYS_EXCHANGED);
    } else if (message.type === KeyExchangeMessageType.KEY_HANDSHAKE_ACK) {
      logger.KeyExchange(
        `[KeyExchange: onKeyExchangeMessage()] KEY_HANDSHAKE_ACK set keysExchanged to true!`,
      );

      this.checkStep([
        KeyExchangeMessageType.KEY_HANDSHAKE_ACK,
        KeyExchangeMessageType.KEY_HANDSHAKE_NONE,
      ]);
      this.keysExchanged = true;
      // Reset step value for next exchange.
      this.setStep(KeyExchangeMessageType.KEY_HANDSHAKE_ACK);
      this.emit(EventType.KEYS_EXCHANGED);
    }
  }

  resetKeys(ecies?: ECIESProps) {
    this.clean();
    this.myECIES = new ECIES(ecies);
  }

  clean(): void {
    logger.KeyExchange(
      `[KeyExchange: clean()] context=${this.context} reset handshake state`,
    );

    this.setStep(KeyExchangeMessageType.KEY_HANDSHAKE_NONE);
    this.emit(EventType.KEY_INFO, this.step);
    this.keysExchanged = false;
    // Do not uncomment next line otherwise it breaks old sdk compatibility.
    // this.otherPublicKey = undefined;
  }

  start({
    isOriginator,
    force,
  }: {
    isOriginator: boolean;
    force?: boolean;
  }): void {
    const { relayPersistence, protocolVersion } =
      this.communicationLayer.remote.state;

    const v2Protocol = protocolVersion >= 2;

    if (relayPersistence) {
      logger.KeyExchange(
        `[KeyExchange: start()] Ignoring key exchange message because relay persistence is activated`,
      );

      console.log(
        `[KeyExchange: start()] relayPersistence=${relayPersistence}`,
      );
      return;
    }

    logger.KeyExchange(
      `[KeyExchange: start()] context=${this.context} protocolVersion=${protocolVersion} isOriginator=${isOriginator} step=${this.step} force=${force} relayPersistence=${relayPersistence} keysExchanged=${this.keysExchanged}`,
    );

    if (!isOriginator) {
      // force is used to redo keyexchange even if already exchanged.
      if (!this.keysExchanged || force === true) {
        if (v2Protocol) {
          // Ask to start exchange only if not already in progress
          this.communicationLayer.sendMessage({
            type: KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK,
            pubkey: this.myPublicKey,
            v: PROTOCOL_VERSION,
          });
          // Ignore completion --- already consider keys exchanged completed in case mobile to mobile and the client was disconnected
          // We need to be able to send the walletInfo onto the relayer.
          // TODO: this.keysExchanged = true;
        } else {
          // Ask to start exchange only if not already in progress
          this.communicationLayer.sendMessage({
            type: KeyExchangeMessageType.KEY_HANDSHAKE_START,
          });
          this.clean();
        }
      } else {
        logger.KeyExchange(
          `[KeyExchange: start()] don't send KEY_HANDSHAKE_START -- exchange already done.`,
        );
      }

      return;
    }

    if (
      (this.keysExchanged ||
        (this.step !== KeyExchangeMessageType.KEY_HANDSHAKE_NONE &&
          this.step !== KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK)) &&
      !force
    ) {
      // Key exchange can be restarted if the wallet ask for a new key.
      logger.KeyExchange(
        `[KeyExchange: start()] context=${
          this.context
        } -- key exchange already ${
          this.keysExchanged ? 'done' : 'in progress'
        } -- aborted.`,
        this.step,
      );
      return;
    }

    logger.KeyExchange(
      `[KeyExchange: start()] context=${this.context} -- start key exchange (force=${force}) -- step=${this.step}`,
      this.step,
    );

    this.clean();
    // except a SYN_ACK for next step
    this.setStep(KeyExchangeMessageType.KEY_HANDSHAKE_SYNACK);
    // From v0.2.0, we Always send the public key because exchange can be restarted at any time.
    this.communicationLayer.sendMessage({
      type: KeyExchangeMessageType.KEY_HANDSHAKE_SYN,
      pubkey: this.myPublicKey,
      v: PROTOCOL_VERSION,
    });
  }

  setStep(step: KeyExchangeMessageType): void {
    this.step = step;
    this.emit(EventType.KEY_INFO, step);
  }

  checkStep(stepList: string[]): void {
    if (stepList.length > 0 && stepList.indexOf(this.step.toString()) === -1) {
      // Graceful warning but continue communication
      console.warn(
        `[KeyExchange: checkStep()]  Wrong Step "${this.step}" not within ${stepList}`,
      );
    }
  }

  setRelayPersistence({
    localKey,
    otherKey,
  }: {
    localKey: string;
    otherKey: string;
  }) {
    console.warn(`[KeyExchange: setRelayPersistence()] localKey`, localKey);
    this.otherPublicKey = otherKey;
    this.myECIES = new ECIES({ privateKey: localKey, debug: this.debug });
    this.keysExchanged = true;
  }

  setKeysExchanged(keysExchanged: boolean) {
    this.keysExchanged = keysExchanged;
  }

  areKeysExchanged() {
    return this.keysExchanged;
  }

  getMyPublicKey() {
    return this.myPublicKey;
  }

  getOtherPublicKey() {
    return this.otherPublicKey;
  }

  setOtherPublicKey(otherPubKey: string) {
    logger.KeyExchange(`[KeyExchange: setOtherPubKey()]`, otherPubKey);

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
    return JSON.stringify(buf);
  }
}
