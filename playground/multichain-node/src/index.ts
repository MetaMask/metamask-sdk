import { createMetamaskSDK, type SessionData } from '@metamask/multichain-sdk';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora, { type Ora } from 'ora';

// Define the states our application can be in
type AppState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'SIGNING';

// Store our application state in a simple object
const state: {
  app: AppState;
  sdk: Awaited<ReturnType<typeof createMetamaskSDK>> | null;
  accounts: { [chainId: string]: string[] }; // Group accounts by chain
  spinner: Ora | null;
} = {
  app: 'DISCONNECTED',
  sdk: null,
  accounts: {}, // Initialize as an empty object
  spinner: null,
};

/**
 * Renders the main menu and handles user input.
 */
const showMenu = async () => {
  // Don't show the menu if we are in a transient state
  if (state.app === 'CONNECTING' || state.app === 'SIGNING') {
    return;
  }

  if (state.app === 'DISCONNECTED') {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'You are disconnected. What would you like to do?',
        choices: ['Connect', 'Exit'],
      },
    ]);
    if (action === 'Connect') {
      await handleConnect();
    } else {
      process.exit(0);
    }
  } else if (state.app === 'CONNECTED') {
    console.log(chalk.green('✓ Connected!'));
    console.log(chalk.bold('Accounts:'));
    for (const chainId in state.accounts) {
      console.log(`  ${chalk.cyan(chainId)}: ${state.accounts[chainId].join(', ')}`);
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: [
          'Sign Ethereum Message',
          'Sign Solana Message',
          'Disconnect'
        ],
      },
    ]);

    if (action === 'Sign Ethereum Message') {
      await handleEthereumSign();
    } else if (action === 'Sign Solana Message') {
      await handleSolanaSign();
    } else if (action === 'Disconnect') {
      await handleDisconnect();
    }
  }
};

// --- Action Handlers (stubs for now) ---

const handleConnect = async () => {
  state.app = 'CONNECTING';
  state.spinner = ora('Connecting... Scan the QR code with your MetaMask Mobile app.').start();

  try {
    // Requesting accounts for Ethereum Mainnet and Solana Mainnet
    await state.sdk?.connect(['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'], []);
  } catch (error: unknown) {
    if (state.spinner) {
      state.spinner.fail('Connection failed or was cancelled.');
    } else {
      console.error(chalk.red('Connection failed or was cancelled.'), error instanceof Error ? error.message : String(error));
    }
    state.app = 'DISCONNECTED'; // Revert state
  }
};

const handleDisconnect = async () => {
  state.spinner = ora('Disconnecting...').start();
  try {
    await state.sdk?.disconnect();
    state.spinner.succeed('Disconnected successfully.');
  } catch (error: unknown) {
    state.spinner.fail('Failed to disconnect.');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  } finally {
    // The 'wallet_sessionChanged' event will handle the state transition
    state.spinner = null;
  }
};

const handleEthereumSign = async () => {
  const chain = 'eip155:1';
  if (!state.accounts[chain] || state.accounts[chain].length === 0) {
    console.log(chalk.red('No Ethereum account connected.'));
    return;
  }
  const accountAddress = state.accounts[chain][0].split(':')[2];

  const { message } = await inquirer.prompt([
    {
      type: 'input',
      name: 'message',
      message: 'Enter the message for Ethereum personal_sign:',
      default: 'Hello from the Ethereum world!',
    },
  ]);

  const messageHex = `0x${Buffer.from(message, 'utf8').toString('hex')}`;

  state.app = 'SIGNING';
  state.spinner = ora('Waiting for Ethereum signature... Please check your MetaMask Mobile app.').start();

  try {
    const result = await state.sdk?.invokeMethod({
      scope: chain,
      request: {
        method: 'personal_sign',
        params: [messageHex, accountAddress], // CORRECT: Send only the hex address
      },
    });
    state.spinner.succeed('Ethereum message signed successfully!');
    console.log(chalk.bold('Signature:'), result);
  } catch (error: unknown) {
    state.spinner.fail('Failed to sign Ethereum message.');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  } finally {
    state.app = 'CONNECTED';
    state.spinner = null;
  }
};

const handleSolanaSign = async () => {
  const chain = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
  if (!state.accounts[chain] || state.accounts[chain].length === 0) {
    console.log(chalk.red('No Solana account connected.'));
    return;
  }
  const accountAddress = state.accounts[chain][0].split(':')[2]; // Extract address from CAIP format

  const { message } = await inquirer.prompt([
    {
      type: 'input',
      name: 'message',
      message: 'Enter the message for Solana signMessage:',
      default: 'Hello from the Solana world!',
    },
  ]);

  const messageBase64 = Buffer.from(message, 'utf8').toString('base64');

  state.app = 'SIGNING';
  state.spinner = ora('Waiting for Solana signature... Please check your MetaMask Mobile app.').start();

  try {
    const result = await state.sdk?.invokeMethod({
      scope: chain,
      request: {
        method: 'signMessage',
        params: {
          account: { address: accountAddress },
          message: messageBase64,
        },
      },
    });
    state.spinner.succeed('Solana message signed successfully!');
    console.log(chalk.bold('Signature:'), result);
  } catch (error: unknown) {
    state.spinner.fail('Failed to sign Solana message.');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  } finally {
    state.app = 'CONNECTED';
    state.spinner = null;
  }
};

/**
 * Main application function.
 */
const main = async () => {
  console.clear();
  console.log(chalk.bold.cyan('MetaMask SDK Node.js Playground'));
  console.log('------------------------------------');

  state.sdk = await createMetamaskSDK({
    dapp: {
      name: 'Node.js Playground',
      url: 'https://playground.metamask.io',
    },
  });

  // --- SDK Event Handler ---
  state.sdk.on('wallet_sessionChanged', (session?: SessionData) => {
    if (state.app !== 'CONNECTING') {
      // Only clear the console if we are not in the middle of a connection flow
      console.clear();
      console.log(chalk.bold.cyan('MetaMask SDK Node.js Playground'));
      console.log('------------------------------------');
    }

    if (state.spinner && state.app === 'CONNECTING') {
      state.spinner.stop();
      state.spinner = null;
    }

    if (session?.sessionScopes) {
      const groupedAccounts: { [chainId: string]: string[] } = {};
      for (const scope of Object.values(session.sessionScopes)) {
        if (scope.accounts) {
          for (const acc of scope.accounts) {
            const [namespace, reference] = acc.split(':');
            const chainId = `${namespace}:${reference}`;
            if (!groupedAccounts[chainId]) {
              groupedAccounts[chainId] = [];
            }
            groupedAccounts[chainId].push(acc);
          }
        }
      }
      state.accounts = groupedAccounts;
      state.app = 'CONNECTED';
    } else {
      state.accounts = {};
      state.app = 'DISCONNECTED';
      console.log(chalk.yellow('Session ended. You are now disconnected.'));
    }
  });

  // --- Main application loop ---
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await showMenu();
    } catch (error) {
      if (state.spinner) state.spinner.stop();
      console.error(chalk.red('An error occurred:'), error);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

main().catch((error) => {
  if (state.spinner) state.spinner.stop();
  console.error(chalk.red('A critical error occurred:'), error);
  process.exit(1);
});
