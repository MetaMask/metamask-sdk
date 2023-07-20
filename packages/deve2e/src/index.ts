import { mainCommunication } from './e2e-communication';
import { ECIESEncryptedCommunicaition } from './e2e-encryption';
import { mainSDK } from './e2e-sdk';

const target =
  process.argv.length > 2 ? process.argv[2] : 'sdk-communication-layer';

console.log(`TARGET: ${target}`);
let methodToCall = mainCommunication;
if (target === 'sdk') {
  methodToCall = mainSDK;
} else if (target === 'ecies') {
  methodToCall = ECIESEncryptedCommunicaition;
}

const startAsync = async () => {
  try {
    await methodToCall();
  } catch (err) {
    console.error(`error: ${err}`);
  }
};

startAsync();
