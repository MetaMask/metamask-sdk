import { createMetamaskSDK } from "@metamask/multichain-sdk";

const validCommands = ['connect'];

(async () => {
  try {
    const [, , startType] = process.argv;
    console.debug(`start NodeJS example`);
    const sdk = await createMetamaskSDK({
			dapp: {
        name: "playground",
        url: "https://playground.metamask.io",
      },
		});
    if (!validCommands.includes(startType)) {
      throw new Error("Invalid command");
    }
    if (startType === 'connect') {
      const connected = await sdk.connect(
        ['eip155:137'],
        ['eip155:137:0x1234567890abcdef1234567890abcdef12345678']
      );
      console.log('connect request accounts',  connected);
    }
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();
