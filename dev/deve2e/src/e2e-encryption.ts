import { ECIES } from '@metamask/sdk-communication-layer';

export const ECIESEncryptedCommunicaition = async () => {
  const Alice = new ECIES();
  const Bob = new ECIES();

  Alice.generateECIES();
  Bob.generateECIES();

  const AlicePublicKey = Alice.getPublicKey();
  const BobPublicKey = Bob.getPublicKey();

  const ABMessage = 'This is a message from Alice to Bob';
  const ABEncryptedMessage = Alice.encrypt(ABMessage, BobPublicKey);
  const ABDecryptedMessage = Bob.decrypt(ABEncryptedMessage);

  console.debug('Alice -> Bob');
  console.debug('Original:', ABMessage);
  console.debug('Encrypted:', ABEncryptedMessage);
  console.debug('Decrypted:', ABDecryptedMessage);
  if (ABMessage === ABDecryptedMessage) {
    console.debug("Bob successfully decrypted Alice's message\n");
  } else {
    console.error("Bob did not decrypt Alice's message!\n");
  }

  const BAMessage = 'This is a message from Bob to Alice';
  const BAEncryptedMessage = Bob.encrypt(BAMessage, AlicePublicKey);
  const BADecryptedMessage = Alice.decrypt(BAEncryptedMessage);

  console.debug('Bob -> Alice');
  console.debug('Original:', BAMessage);
  console.debug('Encrypted:', BAEncryptedMessage);
  console.debug('Decrypted:', BADecryptedMessage);
  if (BAMessage === BADecryptedMessage) {
    console.debug("Alice successfully decrypted Bob's message");
  } else {
    console.error("Alice did not decrypt Bob's message!");
  }
};
