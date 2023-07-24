import path from 'path';
import * as dotenv from 'dotenv';

// const allure = require('allure-commandline');

dotenv.config({ path: path.join(process.cwd(), '.dapps.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

export const config: WebdriverIO.Config = {
  runner: 'local',
  capabilities: [],

  services: [],
  specs: ['../../specs/*.spec.ts'],
  mochaOpts: {
    timeout: 50000,
  },
  exclude: [
    // 'path/to/excluded/files'
  ],
  logLevel: 'debug',

  bail: 0,

  baseUrl: '',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',

  reporters: ['spec', ['allure', { outputDir: 'allure-results' }]],

  /*
  // If you are using Cucumber you need to specify the location of your step definitions.
  onComplete() {
    const reportError = new Error('Could not generate Allure report');
    const generation = allure(['generate', 'allure-results', '--clean']);
    return new Promise<void>((resolve, reject) => {
      const generationTimeout = setTimeout(() => reject(reportError), 5000);

      generation.on('exit', (exitCode: number) => {
        clearTimeout(generationTimeout);

        if (exitCode !== 0) {
          return reject(reportError);
        }

        console.log('Allure report successfully generated');
        return resolve();
      });
    });
  },*/
};
