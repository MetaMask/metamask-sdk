import { describe, expect, it } from '@jest/globals';
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
});
