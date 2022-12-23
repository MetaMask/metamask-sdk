import { mainCommunication } from './e2e-communication';
import { mainSDK } from './e2e-sdk';

const target =
  process.argv.length > 2 ? process.argv[2] : 'sdk-communication-layer';

console.log(`TARGET: ${target}`);
let methodToCall = mainCommunication;
if (target === 'sdk') {
  methodToCall = mainSDK;
}

methodToCall().then(() => {
  console.log(`exiting.`);
});
