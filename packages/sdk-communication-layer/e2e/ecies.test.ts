import { describe, expect, it } from '@jest/globals';
import { PrivateKey, decrypt, encrypt } from 'eciesjs';
import { ECIES } from '../src';

describe('SDK ECIES Encryption', () => {
  const Alice = new ECIES();
  const Bob = new ECIES();

  Alice.generateECIES();
  Bob.generateECIES();

  const AlicePublicKey = Alice.getPublicKey();
  const BobPublicKey = Bob.getPublicKey();

  it('should encrypt message from Alice to Bob and Bob decrypt it', async () => {
    const message = 'This is a message from Alice to Bob';
    const encryptedMessage = Alice.encrypt(message, BobPublicKey);
    const decryptedMessage = Bob.decrypt(encryptedMessage);

    console.debug('Alice -> Bob');
    console.debug('Original:', message);
    console.debug('Encrypted:', encryptedMessage);
    console.debug('Decrypted:', decryptedMessage);
    expect(decryptedMessage).toBe(message);
  });

  it('should encrypt message from Bob to Alice and Alice decrypt it', async () => {
    const message = 'This is a message from Bob to Alice';
    const encryptedMessage = Bob.encrypt(message, AlicePublicKey);
    const decryptedMessage = Alice.decrypt(encryptedMessage);

    console.debug('Bob -> Alice');
    console.debug('Original:', message);
    console.debug('Encrypted:', encryptedMessage);
    console.debug('Decrypted:', decryptedMessage);
    expect(decryptedMessage).toBe(message);
  });

  it(`test1`, async () => {
    // const myECIES = new ECIES();
    // myECIES.generateECIES();
    const privateKey = PrivateKey.fromHex(
      '0x3398de3507912da658c33b201efa59f57b4242dcbe9ac400798b01fac77e3482',
    );

    const encryptedData =
      'BHoxaSTTPG+S/bM370wS4JpZZDVgaufe4en/3MLh7xr42MYy5IMLNQW7SGrT+YfRwZVOFLFC/hNWYhYVjLuzOGj3ir+ErK1T6SHzBLJbQLDP6mv64yatx3IZXyORleMcuwHJPK81ha9ZPkTwRiYKkZ5El6RMk5oKYC4wxgmB0udXzockLLSEZB6yzbvioihJQ6dcQJaAGmOt+xoHfMleIz85cCMeZNbJYK1NAz3BbfL3TXsDe6QtP6djds/zW7VQOqctiERJem/yyjNbDV2ckYNc00aZubNniw==';
    const payload = Buffer.from(encryptedData, 'base64');
    const plainText = decrypt(privateKey.toHex(), payload);
    console.log(`plain: ${plainText}`);

    // const publicKey = myECIES.getPublicKey();
    const message =
      '{"type":"wallet_info","walletInfo":{"type":"MetaMask","version":"MetaMask/Mobile"}}';
    const otherkey =
      '02fd39049f6716e6056784fb4cb9f346370f2b8db42b3fd23283050740b9d8d53e';
    const encryptedMessage = encrypt(otherkey, Buffer.from(message));
    const base64message = Buffer.from(encryptedMessage).toString('base64');
    console.log(`encryptedMessage: `, base64message);

    expect(true).toBe(true);
  });
});
